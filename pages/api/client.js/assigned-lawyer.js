// pages/api/client/assigned-lawyer.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    if (!req.headers.cookie) {
      return res.status(401).json({ message: "Unauthorized - No cookies found" });
    }
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token found" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Forbidden - Invalid token" });
    }

    const clientCases = await prisma.case.findMany({
      where: {
        client: {
          userId: decoded.id
        },
        lawyerId: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1,
      include: {
        lawyer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!clientCases || clientCases.length === 0) {
      return res.status(404).json({ message: "No assigned lawyer found for your cases yet." });
    }

    const assignedLawyer = clientCases[0].lawyer?.user;

    if (!assignedLawyer) {
      return res.status(404).json({ message: "Assigned lawyer data is missing." });
    }

    res.status(200).json({
      lawyer: {
        fullName: assignedLawyer.fullName,
        email: assignedLawyer.email
      }
    });
  } catch (error) {
    console.error("Error fetching assigned lawyer:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
}

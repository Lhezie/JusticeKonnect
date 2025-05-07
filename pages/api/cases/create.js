// pages/api/cases/create.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

// Initialize Prisma Client
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const {
      title = "",
      description = "",
      issueType = "",
      address = "",
      city = "",
      zipCode = "",
      country = "",
      additionalInfo = "",
      clientId = null
    } = req.body;

    const userId = clientId || decoded.id;

    if (!title || !description || !issueType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find or create the client profile
    let clientProfile = await prisma.client.findUnique({
      where: { userId: Number(userId) }
    });

    if (!clientProfile) {
      clientProfile = await prisma.client.create({
        data: {
          userId: Number(userId),
          address: address || null
        }
      });
    }

    // Round-robin lawyer assignment
    const availableLawyers = await prisma.lawyer.findMany({
      select: { id: true }
    });

    let assignedLawyerId = null;

    if (availableLawyers.length > 0) {
      const lastAssignedCase = await prisma.case.findFirst({
        where: { lawyerId: { not: null } },
        orderBy: { createdAt: 'desc' }
      });

      if (!lastAssignedCase) {
        assignedLawyerId = availableLawyers[0].id;
      } else {
        const lastIndex = availableLawyers.findIndex(lawyer => lawyer.id === lastAssignedCase.lawyerId);
        const nextIndex = (lastIndex + 1) % availableLawyers.length;
        assignedLawyerId = availableLawyers[nextIndex].id;
      }
    }

    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        issueType,
        address,
        city,
        zipCode,
        country,
        additionalInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientId: clientProfile.id,
        lawyerId: assignedLawyerId
      }
    });

    res.status(201).json({
      message: assignedLawyerId
        ? "Case created and lawyer assigned successfully."
        : "Case created successfully (no lawyer assigned).",
      case: {
        id: newCase.id,
        title: newCase.title,
        lawyerId: assignedLawyerId
      }
    });
  } catch (error) {
    console.error("Error creating case:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
}

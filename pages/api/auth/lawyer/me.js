// pages/api/auth/lawyer/me.js
import { PrismaClient } from "@prisma/client";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

// Initialize Prisma Client
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Log incoming cookies
    console.log("Received Cookies:", req.headers.cookie);

    if (!req.headers.cookie) {
      return res.status(401).json({ message: "Unauthorized - No cookies found" });
    }

    // Parse cookies safely
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.refreshToken; // Ensure this matches the cookie name you set

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token found" });
    }

    // Verify the token using the correct secret
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Forbidden - Invalid token" });
    }

    console.log("Decoded Token:", decoded);

    if (!decoded.id) {
      return res.status(403).json({ message: "Invalid Token Payload - Missing user ID" });
    }

    // Verify this is a lawyer account
    if (decoded.role !== 'lawyer') {
      return res.status(403).json({ message: "Forbidden - Not a lawyer account" });
    }

    // Fetch the user with lawyer profile
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      include: {
        lawyerProfile: true // Include the lawyer profile
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the user is actually a lawyer
    if (user.role !== 'lawyer' || !user.lawyerProfile) {
      return res.status(403).json({ message: "Forbidden - Not a lawyer account" });
    }

    // Format the user data for response
    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      lawyer: {
        professionalId: user.lawyerProfile.professionalId,
        licenseNumber: user.lawyerProfile.licenseNumber,
        organization: user.lawyerProfile.organization,
        specialty: user.lawyerProfile.specialty,
        bio: user.lawyerProfile.bio
      }
    };

    // Return the user data
    res.status(200).json({ user: userData });

  } catch (error) {
    console.error("Error in /api/auth/lawyer/me:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
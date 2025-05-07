// pages/api/cases/stats.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

// Initialize Prisma Client - works in both production and development
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Authentication check
    if (!req.headers.cookie) {
      return res.status(401).json({ message: "Unauthorized - No cookies found" });
    }

    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token found" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Forbidden - Invalid token" });
    }

    // Get the user ID from query parameters or from the token
    const userId = req.query.userId || decoded.id;
    
    // Make sure we have a valid user ID
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the client profile associated with this user
    const clientProfile = await prisma.client.findUnique({
      where: { userId: Number(userId) }
    });

    if (!clientProfile) {
      return res.status(404).json({ 
        message: "Client profile not found",
        submitted: 0,
        underReview: 0,
        approved: 0
      });
    }

    // Count total submitted cases
    const totalCases = await prisma.case.count({
      where: { clientId: clientProfile.id }
    });

    // Count cases under review (status is 'open' or 'review')
    const underReviewCases = await prisma.case.count({
      where: { 
        clientId: clientProfile.id,
        status: { in: ['open', 'review'] }
      }
    });

    // Count approved cases (status is 'approved')
    const approvedCases = await prisma.case.count({
      where: { 
        clientId: clientProfile.id,
        status: 'approved'
      }
    });

    // Return the case statistics
    res.status(200).json({
      submitted: totalCases,
      underReview: underReviewCases,
      approved: approvedCases
    });

  } catch (error) {
    console.error("Error fetching case statistics:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
}
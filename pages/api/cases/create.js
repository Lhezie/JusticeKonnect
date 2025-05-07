// pages/api/cases/create.js - Modified to include lawyer assignment
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

// Initialize Prisma Client - works in both production and development
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("Case creation request received:", req.body);
    
    // Authentication check
    if (!req.headers.cookie) {
      console.log("No cookies found in request");
      return res.status(401).json({ message: "Unauthorized - No cookies found" });
    }

    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.refreshToken;

    if (!token) {
      console.log("No refresh token found in cookies");
      return res.status(401).json({ message: "Unauthorized - No token found" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      console.log("Token decoded successfully:", decoded);
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ message: "Forbidden - Invalid token" });
    }

    // Extract data from request body with defaults to prevent undefined
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

    // Use the client ID from the token if not provided in request
    const userId = clientId || decoded.id;
    console.log("Using user ID:", userId);

    // Validate required fields
    if (!title || !description || !issueType) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // First, find or create a Client profile for this user
    let clientProfile = await prisma.client.findUnique({
      where: { userId: Number(userId) }
    });
    
    // If client profile doesn't exist, create one
    if (!clientProfile) {
      console.log("Creating client profile for user:", userId);
      clientProfile = await prisma.client.create({
        data: {
          userId: Number(userId),
          address: address || null
        }
      });
    }
    
    console.log("Using client profile ID:", clientProfile.id);
    
    // Round-robin lawyer assignment
    // 1. Get all active lawyers
    const availableLawyers = await prisma.lawyer.findMany({
      where: {
        // You can add filters here for active lawyers only
        // For example: isActive: true
      },
      select: {
        id: true,
        userId: true,
        specialty: true
      }
    });
    
    // If no lawyers are available, create case without lawyer assignment
    if (!availableLawyers || availableLawyers.length === 0) {
      console.log("No lawyers available for assignment");
      
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
          clientId: clientProfile.id, // Use the client profile ID, not user ID
          // No lawyer assigned
        }
      });
      
      console.log("Case created without lawyer assignment:", newCase.id);
      
      res.status(201).json({ 
        message: "Case created successfully (no lawyer assigned)", 
        case: {
          id: newCase.id,
          title: newCase.title
        }
      });
      
      return;
    }
    
    // 2. Find the most recently assigned lawyer
    const lastAssignedCases = await prisma.case.findMany({
      where: {
        lawyerId: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1,
      select: {
        lawyerId: true
      }
    });
    
    // 3. Determine the next lawyer for assignment
    let assignedLawyerId;
    
    if (lastAssignedCases.length === 0) {
      // If no previous assignments, pick the first lawyer
      assignedLawyerId = availableLawyers[0].id;
    } else {
      const lastLawyerId = lastAssignedCases[0].lawyerId;
      
      // Find the position of the last assigned lawyer
      const lastIndex = availableLawyers.findIndex(lawyer => lawyer.id === lastLawyerId);
      
      // Get the next lawyer in the list (or circle back to the first)
      const nextIndex = (lastIndex + 1) % availableLawyers.length;
      assignedLawyerId = availableLawyers[nextIndex].id;
    }
    
    console.log(`Assigning case to lawyer ID: ${assignedLawyerId}`);
    
    // 4. Create the case with lawyer assignment
    console.log("Creating case with data:", {
      title,
      description,
      issueType,
      address,
      city,
      zipCode, 
      country,
      additionalInfo,
      clientId: clientProfile.id,
      lawyerId: assignedLawyerId
    });

    // Create case using correct relationship fields
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
        clientId: clientProfile.id, // Use the client profile ID, not user ID
        lawyerId: assignedLawyerId // Assign to the selected lawyer
      }
    });

    console.log("Case created successfully with lawyer assignment:", newCase.id);
    
    res.status(201).json({ 
      message: "Case created successfully and assigned to lawyer", 
      case: {
        id: newCase.id,
        title: newCase.title,
        lawyerId: assignedLawyerId
      }
    });
  } catch (error) {
    console.error("Error creating case:", error);
    
    // More detailed error information
    const errorDetails = {
      message: "Internal Server Error", 
      error: error.message,
      code: error.code || 'UNKNOWN',
      meta: error.meta || {}
    };
    
    console.error("Error details:", errorDetails);
    
    res.status(500).json(errorDetails);
  }
}
// pages/api/cases/submit.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed' 
    });
  }

  // Check for authentication cookies
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - No token found' 
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Validate input
    const { 
      title, 
      description, 
      issueType, 
      address, 
      city, 
      zipCode, 
      country, 
      additionalInfo 
    } = req.body;

    // Validate required fields
    if (!title || !description || !issueType || !address || !city || !zipCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find the client profile
    const client = await prisma.client.findUnique({
      where: { userId: decoded.id },
      include: {
        cases: {
          where: {
            status: {
              in: ['SUBMITTED', 'PENDING', 'APPROVED']
            }
          }
        }
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }

    // Check if client already has a pending or approved case
    if (client.cases && client.cases.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active case in progress'
      });
    }

    // Find all verified lawyers for assignment
    const lawyers = await prisma.lawyer.findMany({
      where: {
        user: {
          isVerified: true,
          role: 'lawyer'
        }
      },
      include: {
        _count: {
          select: { cases: true }
        }
      },
      orderBy: [
        { _count: { cases: 'asc' } }, // Prioritize lawyers with fewer cases for load balancing
        { id: 'asc' } // Secondary sort for consistent results
      ]
    });

    if (lawyers.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No lawyers available for case assignment' 
      });
    }

    // Find the last assigned case to implement round-robin
    const lastAssignedCase = await prisma.case.findFirst({
      where: {
        lawyerId: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        lawyerId: true
      }
    });

    // Determine which lawyer to assign
    let selectedLawyer;
    
    if (!lastAssignedCase) {
      // If no previous case, assign to the first lawyer
      selectedLawyer = lawyers[0];
    } else {
      // Find the index of the last assigned lawyer
      const lastLawyerIndex = lawyers.findIndex(lawyer => lawyer.id === lastAssignedCase.lawyerId);
      
      // Get the next lawyer in the rotation (or wrap around to the beginning)
      const nextLawyerIndex = (lastLawyerIndex + 1) % lawyers.length;
      selectedLawyer = lawyers[nextLawyerIndex];
    }

    // Create case with assigned lawyer
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
        status: 'SUBMITTED',
        clientId: client.id,
        lawyerId: selectedLawyer.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        lawyer: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Log assignment for monitoring/debugging
    console.log(`Case ${newCase.id} assigned to lawyer ${selectedLawyer.id}`);

    // Return success response with case details
    res.status(201).json({
      success: true,
      message: 'Case submitted and assigned successfully',
      case: {
        id: newCase.id,
        title: newCase.title,
        status: newCase.status,
        assignedLawyer: {
          id: selectedLawyer.id,
          name: newCase.lawyer.user.fullName,
          email: newCase.lawyer.user.email
        }
      }
    });
  } catch (error) {
    console.error('Case Submission Error:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });

    // Handle different types of errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit case',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}

// Enable parsing for the request body
export const config = {
  api: {
    bodyParser: true,
  },
};
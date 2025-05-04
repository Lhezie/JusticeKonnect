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
      where: { userId: decoded.id }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }

    // Check if client already has a pending or approved case
    const existingCase = await prisma.case.findFirst({
      where: {
        clientId: client.id,
        OR: [
          { status: 'SUBMITTED' },
          { status: 'PENDING' },
          { status: 'APPROVED' }
        ]
      }
    });

    if (existingCase) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active case in progress'
      });
    }

    // Find all active lawyers
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
        { _count: { cases: 'asc' } }, // Prioritize lawyers with fewer cases
        { id: 'asc' }
      ]
    });

    if (lawyers.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No lawyers available for case assignment' 
      });
    }

    // Select the first lawyer (round-robin with load balancing)
    const selectedLawyer = lawyers[0];

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
        lawyerId: selectedLawyer.id
      },
      include: {
        lawyer: {
          include: {
            user: true
          }
        }
      }
    });

    // Optional: Send notification to lawyer 
    // You could implement email or in-app notification logic here
    console.log(`Case ${newCase.id} assigned to lawyer ${selectedLawyer.id}`);

    res.status(201).json({
      success: true,
      message: 'Case submitted and assigned successfully',
      case: {
        id: newCase.id,
        title: newCase.title,
        status: newCase.status,
        assignedLawyer: {
          id: selectedLawyer.id,
          name: selectedLawyer.user.fullName
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

// Disable body parsing to handle raw body for verification
export const config = {
  api: {
    bodyParser: true,
  },
};
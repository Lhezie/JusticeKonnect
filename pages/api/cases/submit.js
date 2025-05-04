// pages/api/cases/submit.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const prisma = new PrismaClient();

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
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Create case in database
    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        userId: decoded.id,
        status: 'SUBMITTED'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // Success response
    res.status(201).json({
      success: true,
      message: 'Case submitted successfully',
      case: newCase
    });

  } catch (error) {
    // Detailed error logging
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
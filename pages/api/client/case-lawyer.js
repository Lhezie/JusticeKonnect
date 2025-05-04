// pages/api/client/case-lawyer.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    // Get the most recent approved case with lawyer details
    const approvedCase = await prisma.case.findFirst({
      where: {
        clientId: client.id,
        status: 'APPROVED'
      },
      include: {
        lawyer: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        approvedAt: 'desc'
      }
    });

    if (!approvedCase) {
      return res.status(404).json({ 
        success: false,
        message: 'No approved case found' 
      });
    }

    // Get upcoming appointments with this lawyer
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        clientId: decoded.id,
        lawyerId: approvedCase.lawyer.user.id,
        start: {
          gte: new Date() // Only future appointments
        }
      },
      orderBy: {
        start: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      case: {
        id: approvedCase.id,
        title: approvedCase.title,
        description: approvedCase.description,
        status: approvedCase.status,
        approvedAt: approvedCase.approvedAt,
        issueType: approvedCase.issueType
      },
      lawyer: {
        id: approvedCase.lawyer.id,
        name: approvedCase.lawyer.user.fullName,
        email: approvedCase.lawyer.user.email,
        specialty: approvedCase.lawyer.specialty,
        organization: approvedCase.lawyer.organization
      },
      appointments: upcomingAppointments.map(apt => ({
        id: apt.id,
        start: apt.start,
        end: apt.end,
        status: apt.status
      }))
    });
  } catch (error) {
    console.error('Case and Lawyer Retrieval Error:', {
      message: error.message,
      stack: error.stack
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
      message: 'Failed to retrieve case and lawyer details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
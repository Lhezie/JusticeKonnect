// pages/api/lawyer/upcoming-appointments.js
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

    // Verify lawyer profile
    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: decoded.id }
    });

    if (!lawyer) {
      return res.status(403).json({
        success: false,
        message: 'Lawyer profile not found'
      });
    }

    // Get upcoming appointments
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        lawyerId: decoded.id,
        start: {
          gte: new Date() // Only future appointments
        }
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true
              }
            }
          }
        }
      },
      orderBy: {
        start: 'asc'
      }
    });

    // Transform appointments for response
    const formattedAppointments = upcomingAppointments.map(apt => ({
      id: apt.id,
      start: apt.start,
      end: apt.end,
      status: apt.status,
      client: {
        name: apt.client.user.fullName,
        email: apt.client.user.email,
        phone: apt.client.user.phoneNumber
      }
    }));

    // Get pending cases
    const pendingCases = await prisma.case.findMany({
      where: {
        lawyerId: lawyer.id,
        status: 'SUBMITTED'
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      upcomingAppointments: formattedAppointments,
      pendingCases: pendingCases.map(caseItem => ({
        id: caseItem.id,
        title: caseItem.title,
        description: caseItem.description,
        issueType: caseItem.issueType,
        client: {
          name: caseItem.client.user.fullName,
          email: caseItem.client.user.email,
          phone: caseItem.client.user.phoneNumber
        },
        submittedAt: caseItem.createdAt
      }))
    });
  } catch (error) {
    console.error('Upcoming Appointments Retrieval Error:', {
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
      message: 'Failed to retrieve upcoming appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
// pages/api/lawyer/dashboard-data.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

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

    // Find the lawyer profile
    const lawyer = await prisma.lawyer.findFirst({
      where: { 
        userId: decoded.id
      },
      include: {
        user: true
      }
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found'
      });
    }

    // Get counts of different case statuses
    const countsByStatus = await prisma.case.groupBy({
      by: ['status'],
      where: {
        lawyerId: lawyer.id
      },
      _count: {
        id: true
      }
    });

    // Transform count data
    const caseStats = {
      totalCases: 0,
      activeCases: 0,
      completedCases: 0,
      pendingCases: 0
    };

    countsByStatus.forEach(item => {
      caseStats.totalCases += item._count.id;
      
      if (item.status === 'APPROVED') {
        caseStats.activeCases += item._count.id;
      } else if (item.status === 'COMPLETED') {
        caseStats.completedCases += item._count.id;
      } else if (item.status === 'SUBMITTED') {
        caseStats.pendingCases += item._count.id;
      }
    });

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
      },
      take: 5 // Limit to 5 most recent
    });

    // Format pending cases for the response
    const formattedPendingCases = pendingCases.map(pendingCase => ({
      id: pendingCase.id,
      title: pendingCase.title,
      description: pendingCase.description,
      issueType: pendingCase.issueType,
      submittedAt: pendingCase.createdAt,
      client: {
        name: pendingCase.client.user.fullName,
        email: pendingCase.client.user.email,
        phone: pendingCase.client.user.phoneNumber
      }
    }));

    // Get upcoming appointments - check schema first
    let upcomingAppointments = [];
    let appointmentError = null;
    
    try {
      // First, try to get the column names from the Appointment table
      const appointmentInfo = await prisma.$queryRaw`
        SHOW COLUMNS FROM Appointment;
      `;
      
      // For debugging
      console.log("Appointment table structure:", appointmentInfo);
      
      // Check if 'date' exists in the appointment table
      const hasDateField = appointmentInfo.some(col => 
        col.Field === 'date' || col.field === 'date'
      );
      
      // Check if 'start' exists in the appointment table
      const hasStartField = appointmentInfo.some(col => 
        col.Field === 'start' || col.field === 'start'
      );
      
      if (hasDateField) {
        // Use 'date' field
        upcomingAppointments = await prisma.appointment.findMany({
          where: {
            lawyerId: decoded.id,
            date: {
              gte: new Date() // Only future appointments
            }
          },
          include: {
            client: true
          },
          orderBy: {
            date: 'asc'
          },
          take: 5 // Limit to 5 upcoming
        });
      } else if (hasStartField) {
        // Use 'start' field
        upcomingAppointments = await prisma.appointment.findMany({
          where: {
            lawyerId: decoded.id,
            start: {
              gte: new Date() // Only future appointments
            }
          },
          include: {
            client: true
          },
          orderBy: {
            start: 'asc'
          },
          take: 5 // Limit to 5 upcoming
        });
      } else {
        // No recognized date field found
        appointmentError = "Appointment table doesn't have recognized date fields";
      }
    } catch (error) {
      console.error("Error checking appointment table:", error);
      appointmentError = error.message;
      
      // Fall back to an empty array
      upcomingAppointments = [];
    }
    
    // Format appointments for the response
    const formattedAppointments = upcomingAppointments.map(apt => {
      // Determine which fields to use based on what's available
      const start = apt.start || apt.date || null;
      const end = apt.end || (apt.date ? new Date(apt.date.getTime() + 60*60*1000) : null); // Default 1 hour from date
      
      return {
        id: apt.id,
        start: start,
        end: end,
        status: apt.status || 'SCHEDULED',
        client: {
          name: apt.client.fullName,
          email: apt.client.email
        }
      };
    });

    // Return the dashboard data
    res.status(200).json({
      success: true,
      totalCases: caseStats.totalCases,
      activeCases: caseStats.activeCases,
      completedCases: caseStats.completedCases,
      pendingCases: formattedPendingCases,
      upcomingAppointments: formattedAppointments,
      appointmentError: appointmentError
    });
  } catch (error) {
    console.error('Lawyer Dashboard Error:', {
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
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
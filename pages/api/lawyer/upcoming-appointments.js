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

    // Determine the structure of the Appointment table
    let upcomingAppointments = [];
    let hasStart = false;
    let hasDate = false;
    
    try {
      // First check the table structure
      const appointmentInfo = await prisma.$queryRaw`
        SHOW COLUMNS FROM Appointment;
      `;
      
      // Check for appropriate date fields
      hasStart = appointmentInfo.some(col => 
        col.Field === 'start' || col.field === 'start'
      );
      
      hasDate = appointmentInfo.some(col => 
        col.Field === 'date' || col.field === 'date'
      );
      
      // Get appointments based on available fields
      if (hasStart) {
        upcomingAppointments = await prisma.appointment.findMany({
          where: {
            lawyerId: decoded.id,
            start: {
              gte: new Date() // Only future appointments
            }
          },
          select: {
            id: true,
            start: true,
            end: true,
            status: true,
            client: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true
              }
            }
          },
          orderBy: {
            start: 'asc'
          }
        });
      } else if (hasDate) {
        upcomingAppointments = await prisma.appointment.findMany({
          where: {
            lawyerId: decoded.id,
            date: {
              gte: new Date() // Only future appointments
            }
          },
          select: {
            id: true,
            date: true,
            status: true,
            client: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true
              }
            }
          },
          orderBy: {
            date: 'asc'
          }
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Continue with empty array if there's an error
      upcomingAppointments = [];
    }

    // Transform appointments for response
    const formattedAppointments = upcomingAppointments.map(apt => {
      if (hasStart) {
        return {
          id: apt.id,
          start: apt.start,
          end: apt.end,
          status: apt.status,
          client: {
            name: apt.client.fullName,
            email: apt.client.email,
            phone: apt.client.phoneNumber
          }
        };
      } else if (hasDate) {
        // Create start and end times from date (assuming 1 hour appointments)
        const startTime = new Date(apt.date);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
        
        return {
          id: apt.id,
          start: startTime,
          end: endTime,
          status: apt.status,
          client: {
            name: apt.client.fullName,
            email: apt.client.email,
            phone: apt.client.phoneNumber
          }
        };
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
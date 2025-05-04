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

    // Get the most recent active case with lawyer details
    // Using createdAt instead of approvedAt for sorting
    const activeCase = await prisma.case.findFirst({
      where: {
        clientId: client.id,
        status: {
          in: ['SUBMITTED', 'APPROVED']
        }
      },
      include: {
        lawyer: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!activeCase) {
      return res.status(200).json({ 
        success: true,
        message: 'No active case found',
        case: null,
        lawyer: null
      });
    }

    // Check if a lawyer is assigned
    if (!activeCase.lawyer) {
      return res.status(200).json({
        success: true,
        message: 'Case has no assigned lawyer yet',
        case: {
          id: activeCase.id,
          title: activeCase.title,
          description: activeCase.description,
          status: activeCase.status,
          createdAt: activeCase.createdAt,
          issueType: activeCase.issueType
        },
        lawyer: null
      });
    }

    // Get upcoming appointments with this lawyer, using date field if available
    // or falling back if the field isn't found
    let upcomingAppointments = [];
    
    try {
      // Check if appointment table has date field
      const appointmentInfo = await prisma.$queryRaw`
        SHOW COLUMNS FROM Appointment;
      `;
      
      // Find date-related fields
      const hasDateField = appointmentInfo.some(col => 
        col.Field === 'date' || col.field === 'date'
      );
      
      if (hasDateField) {
        upcomingAppointments = await prisma.appointment.findMany({
          where: {
            clientId: decoded.id,
            lawyerId: activeCase.lawyer.userId,
            date: {
              gte: new Date() // Only future appointments
            }
          },
          select: {
            id: true,
            date: true,
            status: true
          },
          orderBy: {
            date: 'asc'
          }
        });
      } else {
        // Just get all appointments if we can't filter by date
        upcomingAppointments = await prisma.appointment.findMany({
          where: {
            clientId: decoded.id,
            lawyerId: activeCase.lawyer.userId
          },
          select: {
            id: true,
            created_at: true,
            status: true
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 5 // Limit to 5 most recent
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Continue with empty appointments array
    }

    // Format appointments for response
    const formattedAppointments = upcomingAppointments.map(apt => {
      // Use whatever date field is available
      const appointmentDate = apt.date || apt.created_at || new Date();
      
      return {
        id: apt.id,
        date: appointmentDate,
        status: apt.status || 'SCHEDULED'
      };
    });

    // Return the case, lawyer, and appointment data
    res.status(200).json({
      success: true,
      case: {
        id: activeCase.id,
        title: activeCase.title,
        description: activeCase.description,
        status: activeCase.status,
        createdAt: activeCase.createdAt,
        issueType: activeCase.issueType
      },
      lawyer: {
        id: activeCase.lawyer.userId,
        name: activeCase.lawyer.user.fullName,
        email: activeCase.lawyer.user.email,
        specialty: activeCase.lawyer.specialty,
        organization: activeCase.lawyer.organization
      },
      appointments: formattedAppointments
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
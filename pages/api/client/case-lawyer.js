// pages/api/client/case-lawyer.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get auth token from cookies
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clientId = decoded.id;

    // Find the most recent case for this client
    const recentCase = await prisma.case.findFirst({
      where: {
        clientId: clientId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        lawyer: true
      }
    });

    // If there's an assigned lawyer, get their availability
    let lawyerAvailability = null;
    if (recentCase?.lawyer) {
      lawyerAvailability = await prisma.availability.findMany({
        where: {
          lawyerId: recentCase.lawyer.id,
          startTime: {
            gte: new Date() // Only future availability
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        take: 10 // Limit to next 10 available slots
      });
    }

    // Return the recent case and associated lawyer if found
    if (recentCase) {
      return res.status(200).json({
        success: true,
        case: {
          id: recentCase.id,
          title: recentCase.issueType,
          status: recentCase.status
        },
        lawyer: recentCase.lawyer ? {
          id: recentCase.lawyer.id,
          name: recentCase.lawyer.fullName,
          specialty: recentCase.lawyer.specialty,
          organization: recentCase.lawyer.organization || '',
          availability: lawyerAvailability ? lawyerAvailability.map(slot => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked
          })) : []
        } : null
      });
    } else {
      // No cases found but request was valid
      return res.status(200).json({
        success: true,
        case: null,
        lawyer: null
      });
    }
  } catch (error) {
    console.error('Error fetching case and lawyer:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch case and lawyer information' });
  }
}
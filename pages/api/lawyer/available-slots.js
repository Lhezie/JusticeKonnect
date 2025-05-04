// pages/api/lawyer/available-slots.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get authentication token from cookies
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: 'Unauthorized - No cookies' });
  }

  const { refreshToken } = cookie.parse(cookies);
  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized - No token' });
  }

  try {
    // Verify the token and get lawyer ID
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get input from request body
    const { start, end } = req.body;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Find the lawyer by user ID
    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: decoded.id },
      include: { 
        availabilities: {
          where: {
            OR: [
              // One-time availability slots
              {
                startTime: { gte: new Date(start) },
                endTime: { lte: new Date(end) }
              },
              // Recurring availability slots
              {
                isRecurring: true
              }
            ]
          }
        }
      }
    });

    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    // Format and return the availability slots
    const formattedSlots = lawyer.availabilities.map(slot => ({
      id: `avail-${slot.id}`,
      start: slot.startTime.toISOString(),
      end: slot.endTime.toISOString(),
      ...(slot.isRecurring && {
        daysOfWeek: JSON.parse(slot.recurringDays),
        startTime: slot.startTime.toTimeString().substring(0, 5),
        endTime: slot.endTime.toTimeString().substring(0, 5),
      }),
      display: 'background',
      backgroundColor: '#a0e4b0'
    }));

    res.status(200).json({ available: formattedSlots });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ error: 'Failed to get available slots', details: error.message });
  }
}
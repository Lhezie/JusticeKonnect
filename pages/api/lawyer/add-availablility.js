// pages/api/lawyer/add-availability.js
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
    // Verify the token and get user ID
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get input from request body
    const { start, end, isRecurring, daysOfWeek } = req.body;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Find the lawyer by user ID
    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: decoded.id }
    });

    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    // Create the availability slot
    const availabilityData = {
      lawyerId: lawyer.id,
      startTime: new Date(start),
      endTime: new Date(end),
      isRecurring: isRecurring || false,
    };

    // If it's a recurring slot, add the days of week
    if (isRecurring && daysOfWeek) {
      availabilityData.recurringDays = JSON.stringify(daysOfWeek);
    }

    const availability = await prisma.availability.create({
      data: availabilityData
    });

    // Format the response
    const formattedSlot = {
      id: `avail-${availability.id}`,
      start: availability.startTime.toISOString(),
      end: availability.endTime.toISOString(),
      ...(availability.isRecurring && {
        daysOfWeek: JSON.parse(availability.recurringDays),
        startTime: availability.startTime.toTimeString().substring(0, 5),
        endTime: availability.endTime.toTimeString().substring(0, 5),
      }),
      display: 'background',
      backgroundColor: '#a0e4b0'
    };

    res.status(201).json({ success: true, availability: formattedSlot });
  } catch (error) {
    console.error('Error adding availability:', error);
    res.status(500).json({ error: 'Failed to add availability', details: error.message });
  }
}
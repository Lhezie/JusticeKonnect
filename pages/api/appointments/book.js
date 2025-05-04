// pages/api/appointments/book.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Verify authentication
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: 'Unauthorized - No cookies' });
  }
  
  const { refreshToken } = cookie.parse(cookies);
  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized - No token' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get request data
    const { clientId, lawyerId, start, end } = req.body;
    
    // Validate required fields
    if (!clientId || !lawyerId || !start || !end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if the authenticated user is the client
    if (decoded.id !== parseInt(clientId)) {
      return res.status(403).json({ error: 'Not authorized to book for this client' });
    }
    
    // Parse dates
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Check if the slot is available
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: parseInt(lawyerId) },
      include: {
        availabilities: {
          where: {
            OR: [
              // One-time availability that contains this slot
              {
                isRecurring: false,
                startTime: { lte: startDate },
                endTime: { gte: endDate }
              },
              // Recurring availability for this day of week
              {
                isRecurring: true
              }
            ]
          }
        }
      }
    });
    
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer not found' });
    }
    
    // Check if there's an availability slot that contains this appointment time
    let slotAvailable = false;
    
    // Check non-recurring availabilities
    const nonRecurringSlots = lawyer.availabilities.filter(a => !a.isRecurring);
    for (const slot of nonRecurringSlots) {
      if (slot.startTime <= startDate && slot.endTime >= endDate) {
        slotAvailable = true;
        break;
      }
    }
    
    // Check recurring availabilities
    if (!slotAvailable) {
      const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const recurringSlots = lawyer.availabilities.filter(a => a.isRecurring);
      
      for (const slot of recurringSlots) {
        const recurringDays = JSON.parse(slot.recurringDays || '[]');
        
        if (recurringDays.includes(dayOfWeek)) {
          // Extract time parts for comparison
          const startTime = slot.startTime.toTimeString().substring(0, 5);
          const endTime = slot.endTime.toTimeString().substring(0, 5);
          
          const appointmentStartTime = startDate.toTimeString().substring(0, 5);
          const appointmentEndTime = endDate.toTimeString().substring(0, 5);
          
          if (startTime <= appointmentStartTime && endTime >= appointmentEndTime) {
            slotAvailable = true;
            break;
          }
        }
      }
    }
    
    if (!slotAvailable) {
      return res.status(400).json({ error: 'Selected time slot is not available' });
    }
    
    // Check if there's an existing appointment that overlaps
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        lawyerId: lawyer.userId,
        OR: [
          // Completely overlapping
          {
            start: { lte: startDate },
            end: { gte: endDate }
          },
          // Start overlaps
          {
            start: { lte: startDate },
            end: { gt: startDate }
          },
          // End overlaps
          {
            start: { lt: endDate },
            end: { gte: endDate }
          },
          // Contained within
          {
            start: { gte: startDate },
            end: { lte: endDate }
          }
        ]
      }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }
    
    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: parseInt(clientId),
        lawyerId: lawyer.userId,
        start: startDate,
        end: endDate,
        created_at: new Date()
      }
    });
    
    // Return success
    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({
      error: 'Failed to book appointment',
      details: error.message
    });
  }
}
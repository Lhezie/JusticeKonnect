// pages/api/client/book-appointment.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    // Get request body
    const { availabilityId, caseId } = req.body;
    
    if (!availabilityId) {
      return res.status(400).json({ success: false, message: 'Availability ID is required' });
    }

    if (!caseId) {
      return res.status(400).json({ success: false, message: 'Case ID is required' });
    }

    // Check if the availability slot exists and is not already booked
    const availabilitySlot = await prisma.availability.findUnique({
      where: {
        id: availabilityId,
      },
    });

    if (!availabilitySlot) {
      return res.status(404).json({ success: false, message: 'Availability slot not found' });
    }

    if (availabilitySlot.isBooked) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    // Check if the case exists and belongs to the client
    const clientCase = await prisma.case.findFirst({
      where: {
        id: caseId,
        clientId: clientId,
      },
    });

    if (!clientCase) {
      return res.status(404).json({ success: false, message: 'Case not found or not owned by this client' });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        caseId: caseId,
        clientId: clientId,
        lawyerId: availabilitySlot.lawyerId,
        startTime: availabilitySlot.startTime,
        endTime: availabilitySlot.endTime,
        status: 'CONFIRMED',
      },
    });

    // Mark the availability slot as booked
    await prisma.availability.update({
      where: {
        id: availabilityId,
      },
      data: {
        isBooked: true,
        appointmentId: appointment.id,
      },
    });

    // Return success with the appointment details
    return res.status(200).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment.id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
}
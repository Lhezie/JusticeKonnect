// pages/api/appointments/book.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import nodemailer from 'nodemailer';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

// Configure email transporter 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

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
  
  const { lawyerId, start, end } = req.body;
  
  if (!lawyerId || !start || !end) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find the client profile
    const client = await prisma.client.findUnique({
      where: { userId: decoded.id },
      include: {
        user: true
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client profile not found' });
    }
    
    // Check if client has an approved case with this lawyer
    const approvedCase = await prisma.case.findFirst({
      where: {
        clientId: client.id,
        lawyerId: parseInt(lawyerId),
        status: 'APPROVED'
      },
      include: {
        lawyer: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!approvedCase) {
      return res.status(403).json({
        error: 'You can only book appointments for approved cases with your assigned lawyer'
      });
    }
    
    // Check lawyer's availability
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        lawyerId: approvedCase.lawyer.user.id,
        OR: [
          // Check for overlapping appointments
          {
            start: { lt: new Date(end) },
            end: { gt: new Date(start) }
          }
        ]
      }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        error: 'Selected time slot is not available'
      });
    }
    
    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.user.id,
        lawyerId: approvedCase.lawyer.user.id,
        start: new Date(start),
        end: new Date(end),
        status: 'SCHEDULED'
      }
    });
    
    // Send email notifications
    try {
      // Notification to client
      await transporter.sendMail({
        from: '"JusticeConnect" <noreply@justiceconnect.com>',
        to: client.user.email,
        subject: 'Appointment Confirmation',
        html: `
          <h1>Appointment Confirmed</h1>
          <p>Dear ${client.user.fullName},</p>
          <p>Your appointment with ${approvedCase.lawyer.user.fullName} has been scheduled.</p>
          <p>Date: ${new Date(start).toLocaleDateString()}</p>
          <p>Time: ${new Date(start).toLocaleTimeString()} - ${new Date(end).toLocaleTimeString()}</p>
          <br/>
          <p>Best regards,<br/>JusticeConnect Team</p>
        `
      });
      
      // Notification to lawyer
      await transporter.sendMail({
        from: '"JusticeConnect" <noreply@justiceconnect.com>',
        to: approvedCase.lawyer.user.email,
        subject: 'New Appointment Scheduled',
        html: `
          <h1>New Appointment</h1>
          <p>Dear ${approvedCase.lawyer.user.fullName},</p>
          <p>A new appointment has been scheduled with ${client.user.fullName}.</p>
          <p>Date: ${new Date(start).toLocaleDateString()}</p>
          <p>Time: ${new Date(start).toLocaleTimeString()} - ${new Date(end).toLocaleTimeString()}</p>
          <br/>
          <p>Best regards,<br/>JusticeConnect Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError);
    }
    
    res.status(201).json({
      success: true,
      appointment: {
        id: appointment.id,
        start: appointment.start,
        end: appointment.end,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({
      error: 'Failed to book appointment',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
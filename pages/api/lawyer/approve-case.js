// pages/api/lawyer/approve-case.js
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
  
  const { caseId, additionalNotes } = req.body;
  
  if (!caseId) {
    return res.status(400).json({ error: 'Case ID is required' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find lawyer profile
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        lawyerProfile: true
      }
    });
    
    if (!user || !user.lawyerProfile) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }
    
    // Find the case and ensure it belongs to this lawyer
    const caseToApprove = await prisma.case.findFirst({
      where: {
        id: parseInt(caseId),
        lawyerId: user.lawyerProfile.id,
        status: 'SUBMITTED' // Only allow approval of submitted cases
      },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!caseToApprove) {
      return res.status(404).json({ error: 'Case not found or not assigned to you' });
    }
    
    // Update the case status
    const updatedCase = await prisma.case.update({
      where: { id: parseInt(caseId) },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        lawyerNotes: additionalNotes || null
      },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    });
    
    // Send email notification to client
    try {
      await transporter.sendMail({
        from: '"JusticeConnect" <noreply@justiceconnect.com>',
        to: caseToApprove.client.user.email,
        subject: 'Your Case Has Been Approved',
        html: `
          <h1>Case Approval Notification</h1>
          <p>Dear ${caseToApprove.client.user.fullName},</p>
          <p>Your case (${updatedCase.title}) has been approved by ${user.fullName}.</p>
          ${additionalNotes ? `<p>Additional Notes: ${additionalNotes}</p>` : ''}
          <p>You can now book an appointment with your assigned lawyer.</p>
          <br/>
          <p>Best regards,<br/>JusticeConnect Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }
    
    res.status(200).json({
      success: true,
      case: {
        id: updatedCase.id,
        title: updatedCase.title,
        status: updatedCase.status,
        client: {
          id: caseToApprove.client.user.id,
          name: caseToApprove.client.user.fullName
        }
      }
    });
  } catch (error) {
    console.error('Error approving case:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({
      error: 'Failed to approve case',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}
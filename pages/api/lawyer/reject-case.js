// pages/api/lawyer/reject-case.js
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
  
  const { caseId, rejectionReason } = req.body;
  
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
    const caseToReject = await prisma.case.findFirst({
      where: {
        id: parseInt(caseId),
        lawyerId: user.lawyerProfile.id,
        status: 'SUBMITTED'
      },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!caseToReject) {
      return res.status(404).json({ error: 'Case not found or not assigned to you' });
    }
    
    // Update the case status
    const updatedCase = await prisma.case.update({
      where: { id: parseInt(caseId) },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason || null,
        updatedAt: new Date()
      }
    });
    
    // Send email notification to client
    try {
      await transporter.sendMail({
        from: '"JusticeConnect" <noreply@justiceconnect.com>',
        to: caseToReject.client.user.email,
        subject: 'Case Rejection Notification',
        html: `
          <h1>Case Rejection Notification</h1>
          <p>Dear ${caseToReject.client.user.fullName},</p>
          <p>We regret to inform you that your case (${caseToReject.title}) has been rejected.</p>
          ${rejectionReason ? `<p>Reason for Rejection: ${rejectionReason}</p>` : ''}
          <p>Please contact our support team for further assistance.</p>
          <br/>
          <p>Best regards,<br/>JusticeConnect Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Case rejected successfully',
      case: {
        id: updatedCase.id,
        title: updatedCase.title,
        status: updatedCase.status
      }
    });
  } catch (error) {
    console.error('Error rejecting case:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({
      error: 'Failed to reject case',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
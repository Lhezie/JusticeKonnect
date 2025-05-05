// pages/api/cases/check-approval.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed' 
    });
  }

  // Get clientId and lawyerId from query params
  const { clientId, lawyerId } = req.query;
  
  if (!clientId || !lawyerId) {
    return res.status(400).json({
      success: false,
      message: 'Both clientId and lawyerId are required'
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
    
    // Ensure the authenticated user is either the client or the lawyer
    if (decoded.id !== parseInt(clientId) && decoded.id !== parseInt(lawyerId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You can only check cases you are a party to'
      });
    }

    // Find the client profile
    const client = await prisma.client.findFirst({
      where: { 
        userId: parseInt(clientId)
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Find the lawyer profile
    const lawyer = await prisma.lawyer.findFirst({
      where: { 
        userId: parseInt(lawyerId)
      }
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    // Check if there's an approved case between this client and lawyer
    const approvedCase = await prisma.case.findFirst({
      where: {
        clientId: client.id,
        lawyerId: lawyer.id,
        status: 'APPROVED'
      }
    });

    // Return approval status
    res.status(200).json({
      success: true,
      approved: !!approvedCase, // Convert to boolean
      caseId: approvedCase?.id || null
    });
  } catch (error) {
    console.error('Case Approval Check Error:', {
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
      message: 'Failed to check case approval status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
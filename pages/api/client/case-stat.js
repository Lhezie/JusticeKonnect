// pages/api/client/case-stats.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

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

    // Count cases by status
    const caseCounts = {
      submittedCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      totalCount: 0
    };

    // Get all cases for this client
    const cases = await prisma.case.findMany({
      where: {
        clientId: client.id
      }
    });

    // Count by status
    cases.forEach(caseItem => {
      caseCounts.totalCount++;
      
      switch(caseItem.status) {
        case 'SUBMITTED':
          caseCounts.submittedCount++;
          break;
        case 'PENDING':
          caseCounts.pendingCount++;
          break;
        case 'APPROVED':
          caseCounts.approvedCount++;
          break;
        case 'REJECTED':
          caseCounts.rejectedCount++;
          break;
      }
    });

    // Return the stats
    res.status(200).json({
      success: true,
      ...caseCounts
    });
  } catch (error) {
    console.error('Case Stats Error:', {
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
      message: 'Failed to retrieve case statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
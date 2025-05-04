// pages/api/client/case-stats.js
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

    // Query database for case counts by status
    const submittedCount = await prisma.case.count({
      where: {
        clientId: clientId,
      },
    });

    const pendingCount = await prisma.case.count({
      where: {
        clientId: clientId,
        status: 'PENDING',
      },
    });

    const approvedCount = await prisma.case.count({
      where: {
        clientId: clientId,
        status: 'APPROVED',
      },
    });

    // Return the counts
    return res.status(200).json({
      success: true,
      submittedCount,
      pendingCount,
      approvedCount,
    });
  } catch (error) {
    console.error('Error fetching case stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch case statistics' });
  }
}
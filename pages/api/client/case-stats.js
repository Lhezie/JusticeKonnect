// pages/api/client/case-stats.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  // Parse cookies and get our access token
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized: No token' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('Invalid or expired token in case-stats:', err);
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized: Invalid token' });
  }
  const clientId = decoded.id;

  try {
    // Count total, pending, and approved cases for this client
    const [ submittedCount, pendingCount, approvedCount ] = await Promise.all([
      prisma.case.count({ where: { clientId } }),
      prisma.case.count({ where: { clientId, status: 'PENDING' } }),
      prisma.case.count({ where: { clientId, status: 'APPROVED' } }),
    ]);

    return res.status(200).json({
      success: true,
      submittedCount,
      pendingCount,
      approvedCount,
    });
  } catch (error) {
    console.error('Error fetching case stats:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch case statistics' });
  }
}

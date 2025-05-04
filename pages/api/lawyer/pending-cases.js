// pages/api/lawyer/pending-cases.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    
    // Get pending cases assigned to this lawyer
    const pendingCases = await prisma.case.findMany({
      where: {
        lawyerId: user.lawyerProfile.id,
        status: 'pending'
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({ cases: pendingCases });
  } catch (error) {
    console.error('Error fetching pending cases:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({
      error: 'Failed to fetch pending cases',
      details: error.message
    });
  }
}
// pages/api/lawyer/pending-cases.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default async function handler(req, res) {
  // Comprehensive logging for debugging
  console.log('Pending Cases API Request:', {
    method: req.method,
    cookies: req.headers.cookie ? 'Cookies Present' : 'No Cookies'
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed',
      error: 'Only GET method is supported' 
    });
  }
  
  // Verify authentication
  const cookies = req.headers.cookie;
  if (!cookies) {
    console.log('No cookies found in request');
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized - No cookies' 
    });
  }
  
  const parsedCookies = cookie.parse(cookies);
  const refreshToken = parsedCookies.refreshToken;
  
  if (!refreshToken) {
    console.log('No refresh token found in cookies');
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized - No token' 
    });
  }
  
  try {
    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        details: tokenError.message 
      });
    }

    // Log decoded token info (be careful not to log sensitive data)
    console.log('Decoded Token User ID:', decoded.id);
    
    // Find user with lawyer profile
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id,
        role: 'lawyer' // Ensure it's a lawyer
      },
      include: {
        lawyerProfile: true
      }
    });
    
    if (!user) {
      console.log('No lawyer user found with ID:', decoded.id);
      return res.status(404).json({ 
        success: false,
        error: 'Lawyer profile not found' 
      });
    }

    if (!user.lawyerProfile) {
      console.log('User exists but has no lawyer profile');
      return res.status(404).json({ 
        success: false,
        error: 'Lawyer profile not completely set up' 
      });
    }
    
    // Get pending cases assigned to this lawyer
    const pendingCases = await prisma.case.findMany({
      where: {
        lawyerId: user.lawyerProfile.id,
        status: 'SUBMITTED'
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
    
    console.log('Pending Cases Found:', pendingCases.length);
    
    res.status(200).json({ 
      success: true,
      cases: pendingCases.map(caseItem => ({
        id: caseItem.id,
        title: caseItem.title,
        description: caseItem.description,
        issueType: caseItem.issueType,
        createdAt: caseItem.createdAt,
        client: {
          name: caseItem.client.user.fullName,
          email: caseItem.client.user.email,
          phone: caseItem.client.user.phoneNumber
        }
      }))
    });
  } catch (error) {
    console.error('Comprehensive Error in Pending Cases API:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Unexpected error occurred'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
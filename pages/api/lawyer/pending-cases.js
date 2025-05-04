// pages/api/lawyer/pending-cases.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default async function handler(req, res) {
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
      message: 'Unauthorized - No cookies found' 
    });
  }
  
  const parsedCookies = cookie.parse(cookies);
  const refreshToken = parsedCookies.refreshToken;
  
  if (!refreshToken) {
    console.log('No refresh token found in cookies');
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized - No token found' 
    });
  }
  
  try {
    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      console.log('Decoded Token User ID:', decoded.id);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid authentication token',
        error: tokenError.message 
      });
    }
    
    // First find the user
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id
      }
    });
    
    if (!user) {
      console.log('No user found with ID:', decoded.id);
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if this user is a lawyer
    if (user.role !== 'lawyer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - User is not a lawyer'
      });
    }
    
    // Find lawyer profile for this user
    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: user.id }
    });
    
    if (!lawyer) {
      console.log('No lawyer profile found for user ID:', decoded.id);
      return res.status(404).json({ 
        success: false,
        message: 'Lawyer profile not found' 
      });
    }
    
    // Get pending cases assigned to this lawyer
    const pendingCases = await prisma.case.findMany({
      where: {
        lawyerId: lawyer.id,
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
    
    // Format the response
    const formattedCases = pendingCases.map(caseItem => ({
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
    }));
    
    // Return successful response
    res.status(200).json({ 
      success: true,
      cases: formattedCases
    });
  } catch (error) {
    console.error('Error in Pending Cases API:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Unexpected error occurred'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
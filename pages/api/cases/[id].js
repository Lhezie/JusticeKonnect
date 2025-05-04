// pages/api/cases/[id].js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get case ID from URL
  const { id } = req.query;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid case ID is required' });
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
    
    // Get the case with relationships
    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        lawyer: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    // Check if the user is authorized to view this case
    const isClient = caseData.client.user.id === decoded.id;
    const isLawyer = caseData.lawyer?.user?.id === decoded.id;
    
    if (!isClient && !isLawyer) {
      return res.status(403).json({ error: 'Not authorized to view this case' });
    }
    
    // Return the case data
    res.status(200).json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({
      error: 'Failed to fetch case',
      details: error.message
    });
  }
}
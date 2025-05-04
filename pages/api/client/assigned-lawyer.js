// pages/api/client/assigned-lawyer.js
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
    
    // Find the client
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        clientProfile: true
      }
    });
    
    if (!user || !user.clientProfile) {
      return res.status(404).json({ error: 'Client profile not found' });
    }
    
    // Find cases assigned to this client
    const cases = await prisma.case.findMany({
      where: {
        clientId: user.clientProfile.id,
        lawyerId: { not: null } // Only get cases with assigned lawyers
      },
      include: {
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
    
    // Extract unique lawyers
    const lawyersMap = new Map();
    
    cases.forEach(caseItem => {
      const lawyer = caseItem.lawyer;
      if (lawyer && !lawyersMap.has(lawyer.id)) {
        lawyersMap.set(lawyer.id, {
          id: lawyer.id,
          userId: lawyer.user.id,
          fullName: lawyer.user.fullName,
          email: lawyer.user.email,
          specialty: lawyer.specialty,
          cases: [caseItem]
        });
      } else if (lawyer) {
        const existingLawyer = lawyersMap.get(lawyer.id);
        existingLawyer.cases.push(caseItem);
        lawyersMap.set(lawyer.id, existingLawyer);
      }
    });
    
    // Convert to array
    const lawyers = Array.from(lawyersMap.values());
    
    res.status(200).json(lawyers);
  } catch (error) {
    console.error('Error fetching assigned lawyers:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({
      error: 'Failed to fetch assigned lawyers',
      details: error.message
    });
  }
}
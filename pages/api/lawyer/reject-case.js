// pages/api/lawyer/reject-case.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = new PrismaClient();

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
  
  const { caseId } = req.body;
  
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
        lawyerId: user.lawyerProfile.id
      }
    });
    
    if (!caseToReject) {
      return res.status(404).json({ error: 'Case not found or not assigned to you' });
    }
    
    // Update the case status
    const updatedCase = await prisma.case.update({
      where: { id: parseInt(caseId) },
      data: {
        status: 'rejected',
        updatedAt: new Date()
      }
    });
    
    res.status(200).json({
      success: true,
      case: updatedCase
    });
  } catch (error) {
    console.error('Error rejecting case:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({
      error: 'Failed to reject case',
      details: error.message
    });
  }
}
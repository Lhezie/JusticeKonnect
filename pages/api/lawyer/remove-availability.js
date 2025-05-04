// pages/api/lawyer/remove-availability.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get authentication token from cookies
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: 'Unauthorized - No cookies' });
  }

  const { refreshToken } = cookie.parse(cookies);
  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized - No token' });
  }

  try {
    // Verify the token and get user ID
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get input from request body
    const { slotId } = req.body;
    
    if (!slotId) {
      return res.status(400).json({ error: 'Missing required parameter: slotId' });
    }

    // Parse the slot ID (format is 'avail-{id}')
    const availabilityId = parseInt(slotId.replace('avail-', ''), 10);
    
    if (isNaN(availabilityId)) {
      return res.status(400).json({ error: 'Invalid slot ID format' });
    }

    // Find the lawyer by user ID
    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: decoded.id }
    });

    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    // Find the availability to ensure it belongs to this lawyer
    const availability = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        lawyerId: lawyer.id
      }
    });

    if (!availability) {
      return res.status(404).json({ error: 'Availability slot not found or not owned by this lawyer' });
    }

    // Delete the availability
    await prisma.availability.delete({
      where: { id: availabilityId }
    });

    res.status(200).json({ success: true, message: 'Availability removed successfully' });
  } catch (error) {
    console.error('Error removing availability:', error);
    res.status(500).json({ error: 'Failed to remove availability', details: error.message });
  }
}
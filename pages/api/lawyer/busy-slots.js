// pages/api/lawyer/busy-slots.js
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
    const { start, end } = req.body;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Find the user to get their ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all appointments where this user is the lawyer
    const appointments = await prisma.appointment.findMany({
      where: {
        lawyerId: user.id,
        start: { gte: new Date(start) },
        end: { lte: new Date(end) }
      },
      include: {
        client: {
          select: {
            fullName: true
          }
        }
      }
    });

    // Format the appointments as busy slots
    const busySlots = appointments.map(appointment => ({
      id: `busy-${appointment.id}`,
      start: appointment.start.toISOString(),
      end: appointment.end.toISOString(),
      title: `Appointment with ${appointment.client.fullName}`,
      backgroundColor: '#ff9f89',
      borderColor: '#ff6b6b'
    }));

    res.status(200).json({ busy: busySlots });
  } catch (error) {
    console.error('Error getting busy slots:', error);
    res.status(500).json({ error: 'Failed to get busy slots', details: error.message });
  }
}
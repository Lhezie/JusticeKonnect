// pages/api/lawyer/clients.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    
    // Find the lawyer by user ID
    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: decoded.id }
    });

    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    // Find all cases assigned to this lawyer
    const cases = await prisma.case.findMany({
      where: {
        lawyerId: lawyer.id
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true
              }
            }
          }
        }
      }
    });

    // Extract unique clients from cases
    const clientsMap = new Map();
    cases.forEach(caseItem => {
      const clientUser = caseItem.client.user;
      if (!clientsMap.has(clientUser.id)) {
        clientsMap.set(clientUser.id, {
          id: clientUser.id,
          fullName: clientUser.fullName,
          email: clientUser.email,
          phoneNumber: clientUser.phoneNumber,
          cases: 1
        });
      } else {
        const client = clientsMap.get(clientUser.id);
        client.cases += 1;
        clientsMap.set(clientUser.id, client);
      }
    });

    // Also get appointments to find clients without cases
    const appointments = await prisma.appointment.findMany({
      where: {
        lawyerId: decoded.id
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    // Add clients from appointments if not already included
    appointments.forEach(appointment => {
      const clientUser = appointment.client;
      if (!clientsMap.has(clientUser.id)) {
        clientsMap.set(clientUser.id, {
          id: clientUser.id,
          fullName: clientUser.fullName,
          email: clientUser.email,
          phoneNumber: clientUser.phoneNumber,
          cases: 0
        });
      }
    });

    // Convert map to array
    const clients = Array.from(clientsMap.values());

    res.status(200).json(clients);
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({ error: 'Failed to get clients', details: error.message });
  }
}
// pages/api/book.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientId, lawyerEmail, start, end } = req.body;

  // Validate required fields
  if (!clientId || !lawyerEmail || !start || !end) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Find the lawyer by email
    const lawyer = await prisma.user.findUnique({ 
      where: { email: lawyerEmail },
      select: { id: true }
    });

    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer not found' });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: Number(clientId),
        lawyerId: lawyer.id,
        start: new Date(start),
        end: new Date(end),
        created_at: new Date()
      }
    });

    // Return success
    return res.status(200).json({ 
      success: true, 
      appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({ 
      error: 'Failed to book appointment',
      details: error.message
    });
  }
}
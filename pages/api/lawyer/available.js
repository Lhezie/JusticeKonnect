// pages/api/lawyer/available.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Find all verified lawyers
    const lawyers = await prisma.lawyer.findMany({
      where: {
        user: {
          isVerified: true
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });
    
    // Transform the data for frontend
    const formattedLawyers = lawyers.map(lawyer => ({
      id: lawyer.id,
      userId: lawyer.userId,
      fullName: lawyer.user.fullName,
      email: lawyer.user.email,
      specialty: lawyer.specialty,
      organization: lawyer.organization || ''
    }));
    
    res.status(200).json({ lawyers: formattedLawyers });
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    res.status(500).json({ error: "Failed to fetch lawyers" });
  }
}
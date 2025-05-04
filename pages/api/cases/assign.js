// pages/api/cases/assign.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { caseId } = req.body;
  
  if (!caseId) {
    return res.status(400).json({ error: 'Case ID is required' });
  }
  
  try {
    // 1. Get all active lawyers
    const lawyers = await prisma.lawyer.findMany({
      where: {
        user: {
          isVerified: true,
        }
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    if (lawyers.length === 0) {
      return res.status(404).json({ error: 'No lawyers available' });
    }
    
    // 2. Find the case that needs assignment
    const caseToAssign = await prisma.case.findUnique({
      where: { id: parseInt(caseId) }
    });
    
    if (!caseToAssign) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    // 3. Find the last assigned case
    const lastAssignedCase = await prisma.case.findFirst({
      where: {
        lawyerId: { not: null }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // 4. Determine which lawyer to assign next (round robin)
    let nextLawyerIndex = 0;
    
    if (lastAssignedCase) {
      const lastLawyerId = lastAssignedCase.lawyerId;
      const lastLawyerIndex = lawyers.findIndex(lawyer => lawyer.id === lastLawyerId);
      nextLawyerIndex = (lastLawyerIndex + 1) % lawyers.length;
    }
    
    const nextLawyer = lawyers[nextLawyerIndex];
    
    // 5. Update the case with the assigned lawyer
    const updatedCase = await prisma.case.update({
      where: { id: parseInt(caseId) },
      data: {
        lawyerId: nextLawyer.id,
        status: 'assigned',
        updatedAt: new Date()
      },
      include: {
        lawyer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    // 6. Send notification (in a production environment, you would send emails)
    // Here we'll just log it for demonstration
    console.log(`Case ${caseId} assigned to lawyer ${nextLawyer.id}`);
    
    // 7. Return the updated case
    res.status(200).json({
      success: true,
      case: updatedCase,
      assignedLawyer: {
        id: nextLawyer.id,
        name: updatedCase.lawyer.user.fullName,
        email: updatedCase.lawyer.user.email
      }
    });
  } catch (error) {
    console.error('Error assigning case:', error);
    res.status(500).json({ error: 'Failed to assign case', details: error.message });
  }
}
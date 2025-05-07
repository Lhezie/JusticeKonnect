// pages/api/cases/assignlawyer.js
// A separate endpoint for assigning or reassigning lawyers to cases
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

// Initialize Prisma Client - works in both production and development
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Authentication check
    if (!req.headers.cookie) {
      return res.status(401).json({ message: "Unauthorized - No cookies found" });
    }

    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token found" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Forbidden - Invalid token" });
    }

    // Get the case ID and optional preferred specialty
    const { caseId, preferredSpecialty } = req.body;
    
    if (!caseId) {
      return res.status(400).json({ message: "Case ID is required" });
    }

    // Find the case
    const existingCase = await prisma.case.findUnique({
      where: { id: Number(caseId) },
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
        }
      }
    });

    if (!existingCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Find lawyers based on specialty or get all if no specialty specified
    const lawyerQuery = {
      where: {}
    };
    
    // If specific specialty is requested, filter by it
    if (preferredSpecialty) {
      lawyerQuery.where.specialty = preferredSpecialty;
    }
    
    const availableLawyers = await prisma.lawyer.findMany({
      ...lawyerQuery,
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
    
    if (!availableLawyers || availableLawyers.length === 0) {
      return res.status(404).json({ 
        message: preferredSpecialty 
          ? `No lawyers with specialty '${preferredSpecialty}' found` 
          : "No lawyers available for assignment"
      });
    }
    
    // Get case counts for each lawyer (for workload balancing)
    const lawyerCaseCounts = await Promise.all(
      availableLawyers.map(async (lawyer) => {
        const count = await prisma.case.count({
          where: {
            lawyerId: lawyer.id,
            status: { in: ['open', 'review'] } // Only count active cases
          }
        });
        
        return {
          lawyer,
          activeCount: count
        };
      })
    );
    
    // Sort lawyers by active case count (lowest first)
    lawyerCaseCounts.sort((a, b) => a.activeCount - b.activeCount);
    
    // Select the lawyer with the lowest active case count
    const selectedLawyer = lawyerCaseCounts[0].lawyer;
    
    // Update the case with the assigned lawyer
    const updatedCase = await prisma.case.update({
      where: { id: Number(caseId) },
      data: {
        lawyerId: selectedLawyer.id,
        status: 'review', // Update status to 'review'
        updatedAt: new Date()
      }
    });
    
    // Optional: Send notification to lawyer about new case assignment
    // This would be implemented separately with your notification system
    
    res.status(200).json({
      message: "Lawyer assigned successfully",
      case: {
        id: updatedCase.id,
        title: updatedCase.title,
        status: updatedCase.status
      },
      assignedLawyer: {
        id: selectedLawyer.id,
        name: selectedLawyer.user.fullName,
        specialty: selectedLawyer.specialty
      }
    });
    
  } catch (error) {
    console.error("Error assigning lawyer:", error);
    
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message
    });
  }
}

// ----- 
// Integration into case creation flow:
// In your case creation API, you can add this section:
// -----

/*
// After creating the case
const newCase = await prisma.case.create({...});

// Now assign a lawyer (you could make this optional based on a parameter)
try {
  // Get issue type from the case to match with lawyer specialty
  const issueTypeToSpecialtyMap = {
    'property_theft': 'Criminal',
    'domestic_violence': 'Family',
    'contract_dispute': 'Civil',
    'employment_issue': 'Labor',
    // Add more mappings as needed
  };
  
  const preferredSpecialty = issueTypeToSpecialtyMap[issueType] || null;
  
  // Call the lawyer assignment logic
  const assignmentResponse = await fetch(`${process.env.API_BASE_URL}/api/cases/assignlawyer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': req.headers.cookie // Forward the cookies for authentication
    },
    body: JSON.stringify({
      caseId: newCase.id,
      preferredSpecialty
    })
  });
  
  if (assignmentResponse.ok) {
    const assignmentData = await assignmentResponse.json();
    console.log("Lawyer assigned:", assignmentData);
  }
} catch (assignError) {
  // Log error but don't fail the case creation
  console.error("Failed to assign lawyer, but case was created:", assignError);
}
*/
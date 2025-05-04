// pages/api/upload.js - modify the existing function
import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

export const config = { api: { bodyParser: false } };

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") global.prisma = prisma;

const getSingle = (val) => Array.isArray(val) ? val[0] : val;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // AUTH
  const raw = req.headers.cookie || "";
  const { refreshToken } = cookie.parse(raw);
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).json({ message: "Forbidden - Invalid token" });
  }

  // Find the client profile
  const user = await prisma.user.findUnique({ 
    where: { id: decoded.id },
    include: { clientProfile: true }
  });
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  
  // Create client profile if it doesn't exist
  let client = user.clientProfile;
  if (!client) {
    client = await prisma.client.create({
      data: { userId: user.id }
    });
  }

  // PARSE MULTIPART FORM
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filename: (_field, _ext, part) => `${Date.now()}-${part.originalFilename}`,
  });

  let fields, files;
  try {
    ({ fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => {
        if (err) reject(err);
        else resolve({ fields: flds, files: fls });
      });
    }));
  } catch (err) {
    console.error("❌ Form parse error:", err);
    if (err.code === "ERR_FRAG_EXCEEDED_MAX_FILE_SIZE") {
      return res.status(400).json({ message: "PDF must be less than 5MB" });
    }
    return res.status(400).json({ message: "Error parsing form data" });
  }

  // Pick out the PDF file
  let pdfFile = files.additionalInfo;
  if (Array.isArray(pdfFile)) pdfFile = pdfFile[0];
  if (!pdfFile) {
    return res.status(400).json({ message: "No PDF file uploaded" });
  }
  const savedFilename = path.basename(pdfFile.filepath);

  // WRITE TO DATABASE
  try {
    // Pull strings out of arrays
    const issueType = getSingle(fields.issueType);
    const address = getSingle(fields.address);
    const city = getSingle(fields.city);
    const zipCode = getSingle(fields.zipCode);
    const country = getSingle(fields.country);
    const caseDescription = getSingle(fields.caseDescription);

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        title: issueType,
        description: caseDescription,
        issueType,
        address,
        city,
        zipCode,
        country,
        additionalInfo: savedFilename,
        status: 'pending', // Start as pending
        client: { connect: { id: client.id } },
      },
    });

    // Assign a lawyer (round robin)
    // Find all lawyers
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
      return res.status(200).json({ 
        case: newCase,
        assignmentStatus: 'pending',
        message: 'No lawyers available for assignment'
      });
    }
    
    // Find the last assigned case
    const lastAssignedCase = await prisma.case.findFirst({
      where: {
        lawyerId: { not: null }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Determine which lawyer to assign next (round robin)
    let nextLawyerIndex = 0;
    
    if (lastAssignedCase) {
      const lastLawyerId = lastAssignedCase.lawyerId;
      const lastLawyerIndex = lawyers.findIndex(lawyer => lawyer.id === lastLawyerId);
      
      if (lastLawyerIndex !== -1) {
        nextLawyerIndex = (lastLawyerIndex + 1) % lawyers.length;
      }
    }
    
    const nextLawyer = lawyers[nextLawyerIndex];
    
    // Update the case with the assigned lawyer
    const updatedCase = await prisma.case.update({
      where: { id: newCase.id },
      data: {
        lawyerId: nextLawyer.id,
        status: 'pending', // Still pending until lawyer approves
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
        }
      }
    });
    
    // Send notification (in production environment, would send email)
    console.log(`Case ${newCase.id} assigned to lawyer ${nextLawyer.id}`);
    
    // Save case ID in session/localStorage for redirect
    return res.status(200).json({ 
      case: updatedCase,
      assignmentStatus: 'success',
      assignedLawyer: {
        id: nextLawyer.id,
        name: updatedCase.lawyer.user.fullName
      }
    });
  } catch (dbErr) {
    console.error("❌ Prisma error:", dbErr);
    const message = process.env.NODE_ENV === "development"
      ? dbErr.message
      : "Database error";
    return res.status(500).json({ message });
  }
}
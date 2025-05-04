// pages/api/upload.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

// Disable body parsing to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

// Helper function to parse the form
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Debug: Log all cookies
    console.log('All cookies:', req.headers.cookie);
    
    // Parse cookies to get auth token
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    console.log('Token found:', !!token);
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token found' });
    }

    // Verify JWT token to get client ID
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
    
    if (!decoded.id) {
      console.error('No ID in token:', decoded);
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token structure' });
    }
    
    const clientId = decoded.id;
    
    // Parse the FormData
    const { fields, files } = await parseForm(req);
    
    // Extract fields
    const {
      issueType,
      address,
      city,
      zipCode,
      country,
      caseDescription,
    } = fields;

    console.log('Form fields parsed:', { issueType, address, city });

    // Process the uploaded file
    const pdfFile = files.additionalInfo;
    
    if (!pdfFile) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch (error) {
      console.log('Creating uploads directory');
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate a unique file path for storage
    const fileName = `${Date.now()}-${pdfFile.originalFilename}`;
    const uploadPath = path.join(uploadsDir, fileName);
    
    // Move the temporary file to the permanent location
    await fs.rename(pdfFile.filepath, uploadPath);
    console.log('File moved to:', uploadPath);
    
    // Check if client exists
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });
    
    if (!client) {
      console.error('Client not found:', clientId);
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    console.log('Client found:', client.id);
    
    // Create the case record in the database
    const newCase = await prisma.case.create({
      data: {
        issueType: issueType[0],
        address: address[0],
        city: city[0],
        zipCode: zipCode[0],
        country: country[0],
        description: caseDescription[0],
        filePath: fileName,
        status: 'PENDING', // Default status
        clientId, // Connect to the client
      },
    });

    console.log('Case created successfully:', newCase.id);

    // Return success with the new case ID
    return res.status(200).json({
      success: true,
      message: 'Case submitted successfully',
      caseId: newCase.id,
    });
  } catch (error) {
    console.error('Error uploading case:', error);
    return res.status(500).json({ success: false, message: `Failed to submit case: ${error.message}` });
  }
}
// pages/api/upload.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to allow formidable to parse the request
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Configure formidable
    const form = formidable({
      multiples: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
      uploadDir: uploadsDir,
      filename: (name, ext, part) => {
        // Generate a unique filename to prevent overwriting
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const originalName = part.originalFilename || 'unknown';
        const fileExt = path.extname(originalName);
        const fileName = `${path.basename(originalName, fileExt)}-${uniqueSuffix}${fileExt}`;
        return fileName;
      },
    });

    // Parse the form
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Check if a file was uploaded
    if (!files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = files.file[0] || files.file; // Handle array or single file
    const fileName = path.basename(file.filepath);
    const relativeFilePath = `/uploads/${fileName}`;

    // Return success response with file details
    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: fileName,
      filePath: relativeFilePath,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
}
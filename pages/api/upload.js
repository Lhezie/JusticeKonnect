// pages/api/upload.js
import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

export const config = {
  api: { bodyParser: false },
};

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") global.prisma = prisma;

// helper to extract a single string from formidable’s fields
const getSingle = (val) => Array.isArray(val) ? val[0] : val;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // ─── 1) AUTH ────────────────────────────────────────────────────────────────
  const raw = req.headers.cookie || "";
  const { refreshToken } = cookie.parse(raw);
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(403).json({ message: "Forbidden - Invalid token" });
  }

  // find the client profile
  const client = await prisma.client.findUnique({ where: { userId: decoded.id } });
  if (!client) {
    return res.status(404).json({ message: "Client profile not found" });
  }

  // ─── 2) PARSE MULTIPART FORM ─────────────────────────────────────────────────
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filename: (_field, _ext, part) =>
      `${Date.now()}-${part.originalFilename}`,
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

  // pick out the one pdf file
  let pdfFile = files.additionalInfo;
  if (Array.isArray(pdfFile)) pdfFile = pdfFile[0];
  if (!pdfFile) {
    return res.status(400).json({ message: "No PDF file uploaded" });
  }
  const savedFilename = path.basename(pdfFile.filepath);

  // ─── 3) WRITE TO DATABASE ────────────────────────────────────────────────────
  try {
    // pull strings out of arrays
    const issueType      = getSingle(fields.issueType);
    const address        = getSingle(fields.address);
    const city           = getSingle(fields.city);
    const zipCode        = getSingle(fields.zipCode);
    const country        = getSingle(fields.country);
    const caseDescription= getSingle(fields.caseDescription);

    const newCase = await prisma.case.create({
      data: {
        title:       issueType,          // ← required
        description: caseDescription,    // ← required
        issueType,
        address,
        city,
        zipCode,
        country,
        additionalInfo: savedFilename,
        client: { connect: { id: client.id } },
      },
    });

    return res.status(200).json({ case: newCase });
  } catch (dbErr) {
    console.error("❌ Prisma error:", dbErr);
    const message = process.env.NODE_ENV === "development"
      ? dbErr.message
      : "Database error";
    return res.status(500).json({ message });
  }
}

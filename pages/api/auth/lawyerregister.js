// pages/api/auth/lawyerregister.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") global.prisma = prisma;

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { 
    fullName, 
    email, 
    password, 
    phoneNumber,
    professionalId,
    licenseNumber,
    organization,
    specialty,
    bio
  } = req.body;

  // Validation
  if (!fullName || !email || !password || !phoneNumber || !professionalId || !licenseNumber || !specialty) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    // 1) Check if user already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Also check if professionalId or licenseNumber are already registered
    const existingLawyer = await prisma.lawyer.findFirst({
      where: {
        OR: [
          { professionalId },
          { licenseNumber }
        ]
      }
    });

    if (existingLawyer) {
      return res.status(400).json({ 
        message: existingLawyer.professionalId === professionalId
          ? "Professional ID already registered"
          : "License number already registered"
      });
    }

    // 2) Hash password & create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        role: "lawyer", // Set role to lawyer
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 3) Create corresponding Lawyer profile
    await prisma.lawyer.create({
      data: {
        userId: user.id,
        professionalId,
        licenseNumber,
        organization: organization || null,
        specialty,
        bio: bio || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 4) Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5) Set refreshToken cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
    );

    // 6) Respond with accessToken + user info
    res.status(201).json({
      message: "Lawyer registered successfully",
      accessToken,
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role,
        specialty 
      },
    });
  } catch (error) {
    console.error("Lawyer registration error:", error);
    res.status(500).json({ 
      message: "Registration failed", 
      error: process.env.NODE_ENV === "development" ? error.message : "Server error" 
    });
  }
}
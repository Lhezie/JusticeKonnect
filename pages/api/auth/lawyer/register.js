import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

// Initialize Prisma Client
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: 'lawyer' },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: 'lawyer' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
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

    // Validate required fields
    if (!fullName || !email || !password || !phoneNumber || !professionalId || !licenseNumber) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if professional ID is already used
    const existingLawyerByProfId = await prisma.lawyer.findUnique({
      where: { professionalId }
    });
    if (existingLawyerByProfId) {
      return res.status(400).json({ message: "Professional ID is already registered" });
    }

    // Check if license number is already used
    const existingLawyerByLicense = await prisma.lawyer.findUnique({
      where: { licenseNumber }
    });
    if (existingLawyerByLicense) {
      return res.status(400).json({ message: "License number is already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role 'lawyer'
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        role: "lawyer",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create lawyer profile linked to user
    await prisma.lawyer.create({
      data: {
        userId: newUser.id,
        professionalId,
        licenseNumber,
        organization: organization || null,
        specialty: specialty || null,
        bio: bio || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Store Refresh Token in HttpOnly Cookie
    res.setHeader("Set-Cookie", cookie.serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    }));

    // Return success response
    res.status(201).json({
      message: "Lawyer registered successfully",
      accessToken,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Lawyer Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

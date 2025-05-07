// pages/api/auth/lawyer/login.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

// Initialize Prisma Client - works in both production and development
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Function to generate an Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: 'lawyer' }, 
    process.env.JWT_SECRET, { expiresIn: "15m" });
};

// Function to generate a Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: 'lawyer' }, 
    process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists in the database
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        lawyerProfile: true  // Include lawyer profile if it exists
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify user is a lawyer
    if (user.role !== 'lawyer' || !user.lawyerProfile) {
      return res.status(403).json({ message: "This account is not registered as a lawyer" });
    }

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in HttpOnly Cookie
    res.setHeader("Set-Cookie", cookie.serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    }));

    // Prepare lawyer profile data
    const lawyerData = {
      professionalId: user.lawyerProfile.professionalId,
      licenseNumber: user.lawyerProfile.licenseNumber,
      organization: user.lawyerProfile.organization,
      specialty: user.lawyerProfile.specialty
    };

    // Send Access Token and user data as response
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role,
        lawyer: lawyerData
      },
    });

  } catch (error) {
    console.error("Lawyer Login Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
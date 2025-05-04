// pages/api/auth/lawyerlogin.js
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

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        lawyerProfile: true // Include the lawyer profile
      }
    });
    
    // If no user or user is not a lawyer
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    if (user.role !== "lawyer" || !user.lawyerProfile) {
      return res.status(401).json({ message: "Account is not registered as a lawyer" });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
    );

    // Return user data and access token
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role,
        lawyerId: user.lawyerProfile.id,
        specialty: user.lawyerProfile.specialty
      },
    });
  } catch (error) {
    console.error("Lawyer login error:", error);
    res.status(500).json({ 
      message: "Login failed", 
      error: process.env.NODE_ENV === "development" ? error.message : "Server error" 
    });
  }
}
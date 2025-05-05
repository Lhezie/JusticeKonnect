import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}
console.log("DATABASE_URL:", process.env.DATABASE_URL);

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "45m",
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

  const { fullName, email, password, phoneNumber } = req.body;
  if (!fullName || !email || !password || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 1) Check if user already exists
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // 2) Hash password & create User
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "client",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  // 3) Create corresponding Client profile
  await prisma.client.create({
    data: { userId: user.id },
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
    message: "User created successfully",
    accessToken,
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
  });
}

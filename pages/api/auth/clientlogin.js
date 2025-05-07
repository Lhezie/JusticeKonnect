// pages/api/auth/clientlogin.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as cookie from "cookie";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default async function handler(req, res) {
  // Allow CORS for frontend
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "https://justicekonnect.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  //  POST only
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set session cookie with user ID only
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("sessionUserId", String(user.id), {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    );

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


// // pages/api/auth/clientlogin.js
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import * as cookie from "cookie";

// const prisma = global.prisma || new PrismaClient();
// if (process.env.NODE_ENV === "development") {
//   global.prisma = prisma;
// }

// function generateAccessToken(user) {
//   return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
//     expiresIn: "15m",
//   });
// }

// function generateRefreshToken(user) {
//   return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: "7d",
//   });
// }

// export default async function handler(req, res) {
//   //  Allow CORS for your frontend (replace with actual frontend domain)
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Origin", "https://justicekonnect.vercel.app"); // or your deployed frontend URL
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   //  Handle preflight OPTIONS request
//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }

//   //  Only allow POST
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password required" });
//   }

//   const user = await prisma.user.findUnique({ where: { email } });
//   if (!user) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const accessToken = generateAccessToken(user);
//   const refreshToken = generateRefreshToken(user);

//   res.setHeader(
//     "Set-Cookie",
//     cookie.serialize("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "None",
//       path: "/",
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//     })
//   );

//   return res.status(200).json({
//     message: "Login successful",
//     user,
//     accessToken,
//   });
// }



// // pages/api/auth/clientlogin.js
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import * as cookie from "cookie";

// const prisma = global.prisma || new PrismaClient();
// if (process.env.NODE_ENV === "development") {
//   global.prisma = prisma;
// }
// function generateAccessToken(user) {
//   return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
//     expiresIn: "15m",
//   });
// }

// function generateRefreshToken(user) {
//   return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: "7d",
//   });
// }

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password required" });
//   }

//   const user = await prisma.user.findUnique({ where: { email } });
//   if (!user) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const accessToken = generateAccessToken(user);
//   const refreshToken = generateRefreshToken(user);
//   res.setHeader(
//     "Set-Cookie",
//     cookie.serialize("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite:"None", 
//       path: "/",
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//     })
//   );
//   return res.status(200).json({
//     message: "Login successful",
//     user,
//     accessToken,
//   });
// }


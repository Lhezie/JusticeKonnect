// pages/api/auth/me.js
import { PrismaClient } from "@prisma/client";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ message: "Unauthorized - No cookies" });
  }

  const { refreshToken } = cookie.parse(cookies);
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(403).json({ message: "Forbidden - Invalid token" });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
}

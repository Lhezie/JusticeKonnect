// pages/api/auth/me.js
import { PrismaClient } from "@prisma/client";
import * as cookie from "cookie";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default async function handler(req, res) {
  // CORS headers to allow your frontend domain and localhost
  const allowedOrigins = [
    "https://justicekonnect.vercel.app", // production
    "http://localhost:3000"             // local dev
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Parse cookies
  const { sessionUserId = "" } = cookie.parse(req.headers.cookie || "");
  if (!sessionUserId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // Find user by session ID
    const userId = parseInt(sessionUserId, 10);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Only return non-sensitive fields
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return res.status(500).json({ message: "Server Error" });
  }
}


// // pages/api/auth/me.js
// import { PrismaClient } from "@prisma/client";
// import authenticateToken from "../middleware/authMiddleWare";

// const prisma = global.prisma || new PrismaClient();
// if (process.env.NODE_ENV === "production") {
//   global.prisma = prisma;
// }

// async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Origin", "https://justicekonnect.vercel.app"); // your frontend domain
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }

//   if (req.method !== "GET") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.id },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ user });
//   } catch (err) {
//     console.error("Error fetching user:", err);
//     res.status(500).json({ message: "Server Error" });
//   }
// }

// export default authenticateToken(handler);

// import { PrismaClient } from "@prisma/client";
// import authenticateToken from "../middleware/authMiddleWare";

// const prisma = global.prisma || new PrismaClient();
// if (process.env.NODE_ENV === "development") {
//   global.prisma = prisma;
// }

// async function handler(req, res) {
//   //  CORS headers
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Origin", "https://justicekonnectapp.onrender.com"); // replace with your frontend domain
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

//   //  Handle preflight OPTIONS request
//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }

//   if (req.method !== "GET") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.id },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ user });
//   } catch (err) {
//     console.error("Error fetching user:", err);
//     res.status(500).json({ message: "Server Error" });
//   }
// }

// export default authenticateToken(handler);


// // pages/api/auth/me.js
// import { PrismaClient } from "@prisma/client";
// import authenticateToken from "../middleware/authMiddleWare";

// const prisma = global.prisma || new PrismaClient();
// if (process.env.NODE_ENV === "development") {
//   global.prisma = prisma;
// }
// const handler = async (req, res) => {
//   if (req.method !== "GET") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: req.user.id },
//   });

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   res.status(200).json({ user });
// };

// export default authenticateToken(handler);


// // // pages/api/auth/me.js
// // import { PrismaClient } from "@prisma/client";
// // import authenticateToken from "../middleware/authMiddleWare";
// // import * as cookie from "cookie";
// // import jwt from "jsonwebtoken";

// // const prisma = global.prisma || new PrismaClient();
// // if (process.env.NODE_ENV === "development") {
// //   global.prisma = prisma;
// // }
// // export default async function handler(req, res)   {
// //   authenticateToken(req, res, async () => {
// //   if (req.method !== "GET") {
// //     return res.status(405).json({ message: "Method Not Allowed" });
// //   }

// //   const cookies = req.headers.cookie;
// //   if (!cookies) {
// //     return res.status(401).json({ message: "Unauthorized - No cookies" });
// //   }

// //   const { refreshToken } = cookie.parse(cookies);
// //   if (!refreshToken) {
// //     return res.status(401).json({ message: "Unauthorized - No token" });
// //   }

// //   let decoded;
// //   try {
// //     decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
// //   } catch {
// //     return res.status(403).json({ message: "Forbidden - Invalid token" });
// //   }

// //   const user = await prisma.user.findUnique({ where: { id: decoded.id } });
// //   if (!user) {
// //     return res.status(404).json({ message: "User not found" });
// //   }

// //   res.status(200).json({ user });
// // });

// // }

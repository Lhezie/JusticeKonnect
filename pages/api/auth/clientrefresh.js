// pages/api/auth/clientrefresh.js
import * as cookie from "cookie";

export default function handler(req, res) {
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ message: "Unauthorized - No cookies" });
  }

  const { sessionUserId } = cookie.parse(cookies);
  if (!sessionUserId) {
    return res.status(401).json({ message: "Unauthorized - No session ID" });
  }

  return res.status(200).json({ message: "Session valid", sessionUserId: parseInt(sessionUserId, 10) });
}


// // pages/api/auth/clientrefresh.js
// import jwt from "jsonwebtoken";
// import * as cookie from "cookie";

// export default function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const cookies = req.headers.cookie;

//   if (!cookies) {
//     console.error(" No cookies in request");
//     return res.status(401).json({ message: "Unauthorized - No cookies" });
//   }

//   const { refreshToken } = cookie.parse(cookies);

//   if (!refreshToken) {
//     console.error(" No refresh token in cookies");
//     return res.status(401).json({ message: "Unauthorized - No refresh token" });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

//     // Issue new access token
//     const newAccessToken = jwt.sign(
//       { id: decoded.id, email: decoded.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     return res.status(200).json({ accessToken: newAccessToken });
//   } catch (err) {
//     console.error(" Refresh token verification failed:", err.message);
//     return res.status(403).json({ message: "Invalid or expired refresh token" });
//   }
// }


// import jwt from "jsonwebtoken";
// import * as cookie from "cookie";

// export default function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const cookies = req.headers.cookie;
//   if (!cookies) {
//     console.error("No cookies in request");
//     return res.status(401).json({ message: "Unauthorized - No cookies" });
//   }

//   const { refreshToken } = cookie.parse(cookies);
//   if (!refreshToken) {
//     console.error("No refresh token in cookies");
//     return res.status(401).json({ message: "Unauthorized - No refresh token" });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//     const newAccessToken = jwt.sign(
//       { id: decoded.id, email: decoded.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );
//     return res.status(200).json({ accessToken: newAccessToken });
//   } catch (err) {
//     console.error("Token verification failed:", err);
//     return res.status(403).json({ message: "Invalid refresh token" });
//   }
// }

// import jwt from "jsonwebtoken";
// import cookie from "cookie";  // no need for `* as`

// export default function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const rawCookie = req.headers?.cookie || "";  // fallback to empty string
//   const cookies = cookie.parse(rawCookie);
//   const refreshToken = cookies?.refreshToken;

//   if (!refreshToken) {
//     console.error("No refresh token in cookies");
//     return res.status(401).json({ message: "Unauthorized - No refresh token" });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//     const newAccessToken = jwt.sign(
//       { id: decoded.id, email: decoded.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );
//     return res.status(200).json({ accessToken: newAccessToken });
//   } catch (err) {
//     console.error("Token verification failed:", err);
//     return res.status(403).json({ message: "Invalid refresh token" });
//   }
// }
// 





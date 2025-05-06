// pages/api/middleware/authMiddleWare.js
import jwt from "jsonwebtoken";
import cookie from "cookie";

export default function authenticateToken(handler) {
  return async function (req, res) {
    try {
      const cookies = req.headers.cookie;
      if (!cookies) {
        return res.status(401).json({ message: "Unauthorized - No cookies found" });
      }

      const { refreshToken } = cookie.parse(cookies);
      if (!refreshToken) {
        console.log("🍪 Refresh token:", refreshToken);
        return res.status(401).json({ message: "Unauthorized - No token found" });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      req.user = decoded;

      return handler(req, res); // continue to actual handler
    } catch (error) {
      return res.status(403).json({ message: "Forbidden - Invalid token", error: error.message });
    }
  };
}

// import jwt from "jsonwebtoken";
// import cookie from "cookie";
// export default function authenticateToken(handler) {
//   return async function (req, res) {
//     try {
//       const rawCookie = req.headers.cookie || '';
//       const cookies = cookie.parse(rawCookie);
//       const token = cookies.refreshToken;

//       if (!token) {
//         return res.status(401).json({ message: "Unauthorized - No Token Found" });
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded; // Attach user info to request

//       return handler(req, res); // Proceed to actual handler
//     } catch (error) {
//       console.error("Auth error:", error);
//       return res.status(403).json({ message: "Forbidden - Invalid Token", error: error.message });
//     }
//   };
// }

// // import jwt from "jsonwebtoken";
// // import cookie from "cookie";
// // export default function authenticateToken(req, res, next) {
// //   const rawCookie = req.headers.cookie || '';
// //   //  Check if cookie exists before parsing
// //   if (!rawCookie) {
// //     return res.status(401).json({ message: "Unauthorized - No Cookies Found" });
// //   }

// //   const cookies = cookie.parse(rawCookie);
// //   const token = cookies.refreshToken;

// //   if (!token) {
// //     return res.status(401).json({ message: "Unauthorized - No Token Found" });
// //   }

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     req.user = decoded; // Attach user data for downstream access
// //     next();
// //   } catch (error) {
// //     return res.status(403).json({ message: "Forbidden - Invalid Token", error: error.message });
// //   }
// // }


// // // import jwt from "jsonwebtoken";
// // // import cookie from "cookie";

// // // export default function authenticateToken(req, res, next) {
// // //   const {cookie: rawCookie} = req.headers;
  
// // //   if (!req.headers.cookie) {
// // //     return res.status(401).json({ message: "Unauthorized - No Cookies Found" });
// // //   }

// // //   const cookies = cookie.parse(req.headers.cookie);
// // //   const token = cookies.refreshToken;

// // //   if (!token) {
// // //     return res.status(401).json({ message: "Unauthorized - No Token Found" });
// // //   }

// // //   try {
// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     req.user = decoded; // Attach user data for downstream access
// // //     next();
// // //   } catch (error) {
// // //     return res.status(403).json({ message: "Forbidden - Invalid Token", error: error.message });
// // //   }
// // // }
// // // import jwt from "jsonwebtoken";
// // // import cookie from "cookie";

// // // export default function authenticateToken(req, res, next) {
// // //   if (!req.headers.cookie) {
// // //     return res.status(401).json({ message: "Unauthorized - No Cookies Found" });
// // //   }

// // //   const cookies = cookie.parse(req.headers.cookie);
// // //   const token = cookies.refreshToken; // ✅ Ensure correct cookie name

// // //   if (!token) {
// // //     return res.status(401).json({ message: "Unauthorized - No Token Found" });
// // //   }

// // //   try {
// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     req.user = decoded; // Attach user data
// // //     next();
// // //   } catch (error) {
// // //     return res.status(403).json({ message: "Forbidden - Invalid Token" });
// // //   }
// // // }

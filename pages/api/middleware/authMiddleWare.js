import jwt from "jsonwebtoken";
import cookie from "cookie";

export default function authenticateToken(req, res, next) {
  if (!req.headers.cookie) {
    return res.status(401).json({ message: "Unauthorized - No Cookies Found" });
  }

  const cookies = cookie.parse(req.headers.cookie);
  const token = cookies.refreshToken; // ✅ Ensure correct cookie name

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No Token Found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden - Invalid Token" });
  }
}

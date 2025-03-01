import jwt from "jsonwebtoken";
import * as cookie from "cookie";

export default async function handler(req, res) {
  // Only allow POST requests to refresh the access token
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Extract refresh token from the request headers and cookies
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify and decode the refresh token using the JWT secret key
  const { refreshToken } = cookie.parse(cookies);

  // if it is not refresh token, return an error message
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // If the refresh token is valid, generate a new access token and send it in the response
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Store new access token in HttpOnly cookie
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    // If the refresh token is invalid, return an error message
    res.status(403).json({ message: "Invalid refresh token" });
  }
}

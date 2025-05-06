
import * as cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Clear the refresh token cookie by setting it to empty and expired
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "strict" : "lax",
      path: "/",
      expires: new Date(0), // expire immediately
    })
  );

  return res.status(200).json({ message: "Logged out successfully" });
}

import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.header('Authorization');
    try {
        const token = extractTokenFromHeader(authHeader); // Extract the token
        const user = verifyToken(token); // Verify the token
        req.user = user; // Attach user information to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(403).json({ message: error.message }); // Forbidden
    }
};
import express from 'express';
import rateLimit from 'express-rate-limit';
import { signUpController, loginController } from '../controllers/authController.js';
import { validateSignUp, validateLogin,validateProfileUpdate,validatePasswordChange } from '../middleware/validate.js';

// Configure login rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window
    message: "Too many login attempts from this system, please try again later."
});

const router = express.Router();

// Auth routes
router.post('/signup', validateSignUp, signUpController);
router.post('/login', loginLimiter, validateLogin, loginController);
// router.put('/profile', validateProfileUpdate, profileUpdateController);
// router.put('/change-password', validatePasswordChange, passwordChangeController);

export default router;



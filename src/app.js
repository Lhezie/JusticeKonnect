import express from 'express';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';  
import lawyerRoutes from './routes/lawyerRoutes.js';
import { errorHandler } from './utils/errorHandler.js';  

// Create rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this system, please try again later.'
});

// Initialize Express application
const app = express();

// Apply rate limiter and other middleware
app.use(limiter);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lawyer', lawyerRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;  



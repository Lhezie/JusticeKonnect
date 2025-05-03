import jwt from 'jsonwebtoken';
import { AuthenticationError } from './errors.js';

export const generateToken = (user) => {
  try {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
  } catch (error) {
    throw new AuthenticationError('Error generating token');
  }
};

export const generateRefreshToken = (user) => {
  try {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
      { expiresIn: '7d' }
    );
  } catch (error) {
    throw new AuthenticationError('Error generating refresh token');
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired');
    }
    throw new AuthenticationError('Invalid token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Refresh token has expired');
    }
    throw new AuthenticationError('Invalid refresh token');
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new AuthenticationError('Error decoding token');
  }
};

// Helper function to extract token from authorization header
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No token provided');
  }

  return authHeader.split(' ')[1];
};

// Helper function to generate both access and refresh tokens
export const generateAuthTokens = (user) => {
  try {
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw new AuthenticationError('Error generating authentication tokens');
  }
};


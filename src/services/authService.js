import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import { generateToken } from '../utils/jwt.js';
import { AuthenticationError } from '../utils/errors.js'; 

const prisma = new PrismaClient();

export const signUp = async (userData) => {
  const { 
    name, 
    email, 
    password, 
    professionalId, 
    organization, 
    licenseNumber, 
    specialty, 
    bio, 
    role = 'lawyer' 
  } = userData;

  try {
    const existingUser = await prisma.lawyer.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AuthenticationError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.lawyer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        professionalId: professionalId,
        organization,
        licenseNumber,
        specialty,
        bio,
        role,
      },
    });

    const token = generateToken({ 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        organization: newUser.organization,
        specialty: newUser.specialty,
        professionalID: newUser.professionalID
      }, 
      token 
    };

  } catch (error) {
    console.error('SignUp Error:', error);
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error('Error creating user account');
  }
};

export const login = async ({ email, password, role }) => {
  try {
    const user = await prisma.lawyer.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.role !== role) {
      throw new AuthenticationError('Invalid role for this user');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        specialty: user.specialty,
        professionalID: user.professionalID
      }, 
      token 
    };

  } catch (error) {
    console.error('Login Error:', error);
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error('Login failed');
  }
};

export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.lawyer.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        specialty: true,
        professionalID: true
      }
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return user;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired');
    }
    throw error;
  }
};

export const updateProfile = async (userId, updateData) => {
  try {
    return await prisma.lawyer.update({
      where: { id: userId },
      data: {
        ...updateData,
        password: undefined,
        email: undefined,
        role: undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        specialty: true,
        professionalID: true,
        bio: true
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    if (error.code === 'P2025') {
      throw new Error('User not found');
    }
    throw new Error('Failed to update profile');
  }
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await prisma.lawyer.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Password updated successfully' };
  } catch (error) {
    console.error('Change Password Error:', error);
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error('Failed to change password');
  }
};

// Handle cleanup when the application exits
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
export default {
  signUp,
  login,
  verifyToken,
  updateProfile,
  changePassword,
};






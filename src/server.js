import app from './app.js';
import { PrismaClient } from '@prisma/client';
import dotenv  from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connection established');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);

    });
  }catch (error){
    console.error('Failed to start server:', error);
    process.exit(1);
  }

}
startServer();

// Handle cleanup
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});


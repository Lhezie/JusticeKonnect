import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getChatHistory = async (req, res) => {
  try {
    const { clientId } = req.params;
    const messages = await prisma.message.findMany({
      where: { clientId },
      orderBy: { createdAt: 'asc' },
    });

    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { clientId, content } = req.body;
    const lawyerId = req.user.id;

    const newMessage = await prisma.message.create({
      data: {
        clientId,
        lawyerId,
        content,
      },
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
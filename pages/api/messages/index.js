import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // GET /api/messages?client=1&lawyer=2
    const clientId = parseInt(req.query.client, 10);
    const lawyerId = parseInt(req.query.lawyer, 10);

    if (!clientId || !lawyerId) {
      return res.status(400).json({ error: 'Missing client or lawyer id' });
    }

    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: clientId, receiverId: lawyerId },
            { senderId: lawyerId, receiverId: clientId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
      return res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching messages' });
    }
  }

  if (method === 'POST') {
    // POST /api/messages
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing fields in body' });
    }

    try {
      const message = await prisma.message.create({
        data: {
          senderId: Number(senderId),
          receiverId: Number(receiverId),
          content,
        },
      });
      return res.status(201).json(message);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error creating message' });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
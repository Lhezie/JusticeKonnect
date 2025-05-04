// pages/api/messages/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // GET /api/messages?client=1&lawyer=2
    const clientId = parseInt(req.query.client, 10);
    const lawyerId = parseInt(req.query.lawyer, 10);

    if (!clientId || !lawyerId || isNaN(clientId) || isNaN(lawyerId)) {
      return res.status(400).json({ error: 'Valid client and lawyer IDs are required' });
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
      return res.status(200).json(messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: 'Error fetching messages', details: error.message });
    }
  }

  if (method === 'POST') {
    // POST /api/messages
    const { senderId, receiverId, content } = req.body;
    
    // Validate required fields
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields (senderId, receiverId, content)' });
    }

    // Validate IDs are numeric
    const senderIdNum = parseInt(senderId, 10);
    const receiverIdNum = parseInt(receiverId, 10);
    
    if (isNaN(senderIdNum) || isNaN(receiverIdNum)) {
      return res.status(400).json({ error: 'senderId and receiverId must be valid numbers' });
    }

    try {
      // Check if users exist
      const sender = await prisma.user.findUnique({ where: { id: senderIdNum } });
      const receiver = await prisma.user.findUnique({ where: { id: receiverIdNum } });
      
      if (!sender || !receiver) {
        return res.status(404).json({ 
          error: 'User not found', 
          details: !sender ? 'Sender not found' : 'Receiver not found' 
        });
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          senderId: senderIdNum,
          receiverId: receiverIdNum,
          content,
        },
      });
      
      return res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      return res.status(500).json({ 
        error: 'Error creating message', 
        details: error.message 
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
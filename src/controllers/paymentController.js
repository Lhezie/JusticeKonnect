import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getPaymentSummary = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const payments = await prisma.payment.findMany({
      where: { lawyerId },
    });

    return res.json(payments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.body; 
    // Mock payment verification
    const paymentStatus = { id: paymentId, status: 'verified' }; 

    return res.status(200).json(paymentStatus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
};
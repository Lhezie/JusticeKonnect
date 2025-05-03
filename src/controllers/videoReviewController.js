import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getVideoReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const review = await prisma.videoReview.findUnique({
      where: { appointmentId },
    });

    return res.json(review);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch video review' });
  }
};

export const submitVideoReview = async (req, res) => {
  try {
    const { appointmentId, notes } = req.body;
    const newReview = await prisma.videoReview.create({
      data: {
        appointmentId,
        notes,
      },
    });

    return res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to submit video review' });
  }
};
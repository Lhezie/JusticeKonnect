import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAvailability = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: lawyerId },
      select: { availability: true },
    });

    return res.json(user.availability);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
};
export const updateAvailability = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const { availability } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ error: 'Availability must be an array of dates' });
    }
    // Optionally: further validate each date string format
    const updatedUser = await prisma.user.update({
      where: { id: lawyerId },
      data: { availability },
      select: { id: true, name: true, role: true, availability: true }
    });
    return res.json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update availability' });
  }
};

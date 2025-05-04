import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Function to create or update the availability of the lawyer
 export const createAvailability = async (req, res) => {
  try {
    const lawyerId = req.user.id; // Get the lawyer's ID from the authenticated user
    const { availability } = req.body; // Get the availability from the request body

    // Validate that availability is an array
    if (!Array.isArray(availability)) {
      return res.status(400).json({ error: 'Availability must be an array of dates' });
    }
    // Create or update the lawyer's availability in the database
    const updatedUser = await prisma.user.upsert({
      where: { id: lawyerId },
      update: { availability }, // Update the availability field
      create: { id: lawyerId, availability }, // Create a new entry if it doesn't exist
      select: { id: true, name: true, role: true, availability: true } // Select fields to return
    });

    // Return the updated user information
    return res.json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create availability' });
  }
};
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

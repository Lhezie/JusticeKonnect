import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const listAppointments = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const now = new Date();
    // Fetch upcoming appointments (date >= now) and past appointments (date < now)
    const [upcoming, past] = await Promise.all([
      prisma.appointment.findMany({
        where: { lawyerId, date: { gte: now } },
        orderBy: { date: 'asc' }
      }),
      prisma.appointment.findMany({
        where: { lawyerId, date: { lt: now } },
        orderBy: { date: 'desc' }
      })
    ]);
    return res.json({ upcoming, past });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};
export const acceptAppointment = async (req, res) => {
    try {
      const lawyerId = req.user.id;
      const apptId = Number(req.params.id);
      const result = await prisma.appointment.updateMany({
        where: { id: apptId, lawyerId },
        data: { status: 'accepted' }
      });
      if (result.count === 0) {
        return res.status(404).json({ error: 'Appointment not found or not authorized' });
      }
      const updatedAppt = await prisma.appointment.findUnique({ where: { id: apptId } });
      return res.json(updatedAppt);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to accept appointment' });
    }
  };

export const rescheduleAppointment = async (req, res) => {
    try {
      const lawyerId = req.user.id;
      const apptId = Number(req.params.id);
      const { date } = req.body;
      if (!date || isNaN(Date.parse(date))) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      const result = await prisma.appointment.updateMany({
        where: { id: apptId, lawyerId },
        data: { date: new Date(date), status: 'rescheduled' }
      });
      if (result.count === 0) {
        return res.status(404).json({ error: 'Appointment not found or not authorized' });
      }
      const updatedAppt = await prisma.appointment.findUnique({ where: { id: apptId } });
      return res.json(updatedAppt);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
  };
  
export const cancelAppointment = async (req, res) => {
    try {
      const userId = req.user.id;
      const apptId = Number(req.params.id);
      
      // First check if appointment exists
      const appointment = await prisma.appointment.findUnique({
        where: { id: apptId }
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Allow both lawyer and client to cancel
      if (appointment.lawyerId !== userId && appointment.clientId !== userId) {
        return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
      }

      const result = await prisma.appointment.update({
        where: { id: apptId },
        data: { 
          status: 'cancelled',
          cancelledBy: userId,
          cancelledAt: new Date()
        }
      });

      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to cancel appointment' });
    }
  };  
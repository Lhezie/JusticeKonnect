import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma4 = new PrismaClient();

export default async function handlerBook(req, res) {
  const { clientId, lawyerEmail, start, end } = req.body;
  const lawyer = await prisma4.user.findUnique({ where: { email: lawyerEmail } });
  if (!lawyer) return res.status(404).json({ error: 'Lawyer not found' });

  // create calendar event
  const oauth2Client4 = new google.auth.OAuth2();
  oauth2Client4.setCredentials({
    access_token: lawyer.googleAccessToken,
    refresh_token: lawyer.googleRefreshToken,
  });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client4 });
  await calendar.events.insert({
    calendarId: 'primary',
    requestBody: { start: { dateTime: start }, end: { dateTime: end }, summary: 'Client Booking' },
  });

  // store appointment record
  await prisma4.appointment.create({
    data: {
      clientId,
      lawyerId: lawyer.id,
      start: new Date(start),
      end: new Date(end),
    },
  });

  res.json({ success: true });
}
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma3 = new PrismaClient();

export default async function handlerFreeBusy(req, res) {
  const { email, start, end } = req.body;
  const user = await prisma3.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const oauth2Client3 = new google.auth.OAuth2();
  oauth2Client3.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client3 });
  const fb = await calendar.freebusy.query({
    requestBody: {
      timeMin: start,
      timeMax: end,
      items: [{ id: 'primary' }],
    },
  });

  const busy = fb.data.calendars.primary.busy;
  res.json({ busy });
}
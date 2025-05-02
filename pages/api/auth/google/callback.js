import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma2 = new PrismaClient();
const oauth2Client2 = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
);

export default async function handlerCallback(req, res) {
  const { code } = req.query;
  const { tokens } = await oauth2Client2.getToken(code);
  oauth2Client2.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client2 });
  const { data } = await oauth2.userinfo.get();

  await prisma2.user.upsert({
    where: { email: data.email },
    update: {
      // tokens could represent lawyer or client linking calendar
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token ?? undefined,
      googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    },
    create: {
      email: data.email,
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
      googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    },
  });

  res.redirect('/');
}
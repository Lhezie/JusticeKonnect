// pages/api/twilio/token.js
import twilio from 'twilio';

export default async function handler(req, res) {
  try {
    const { identity } = req.query;
    
    if (!identity) {
      return res.status(400).json({ error: 'Identity parameter is required' });
    }

    console.log("Generating token for identity:", identity);
    console.log("Using Twilio credentials:", {
      accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...',
      apiKey: process.env.TWILIO_API_KEY?.substring(0, 5) + '...',
      apiSecret: process.env.TWILIO_API_SECRET ? 'Present' : 'Missing',
      serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID?.substring(0, 5) + '...'
    });

    // Create an access token
    const AccessToken = twilio.jwt.AccessToken;
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity }
    );

    // Add a Conversations Grant to the token
    const conversationGrant = new AccessToken.ChatGrant({
      serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
    });
    token.addGrant(conversationGrant);

    // Return the token as JSON
    return res.status(200).json({ token: token.toJwt() });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ 
      error: 'Could not generate token', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
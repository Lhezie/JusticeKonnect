// pages/api/freebusy.js
import dayjs from 'dayjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, start, end } = req.body;

  if (!email || !start || !end) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // In production, you would:
  // 1. Look up the lawyer by email
  // 2. Query their calendar for busy times
  // 3. Return actual busy slots

  // For now, generate random busy slots for development
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const busySlots = [];

  // Create some random busy slots within the date range
  let currentDay = startDate.startOf('day');
  while (currentDay.isBefore(endDate)) {
    // 30% chance of having a busy slot on this day
    if (Math.random() < 0.3) {
      // Random hour between 9am and 4pm
      const hour = Math.floor(Math.random() * 8) + 9;
      
      busySlots.push({
        start: currentDay.hour(hour).minute(0).second(0).toISOString(),
        end: currentDay.hour(hour + 1).minute(30).second(0).toISOString()
      });
    }
    
    // Move to next day
    currentDay = currentDay.add(1, 'day');
  }

  // Return the busy slots
  res.status(200).json({ busy: busySlots });
}
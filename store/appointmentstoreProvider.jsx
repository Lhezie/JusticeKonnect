import { create } from 'zustand';

export const useAppointmentStore = create((set) => ({
  busySlots: [],
  selectedSlot: null,
  fetchBusy: async ({ email, start, end }) => {
    const res = await fetch('/api/freebusy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, start, end }) });
    const data = await res.json();
    set({ busySlots: data.busy });
  },
  bookSlot: async ({ clientId, lawyerEmail, start, end }) => {
    await fetch('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, lawyerEmail, start, end }) });
    set({ selectedSlot: { start, end } });
  },
}));
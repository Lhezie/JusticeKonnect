// store/appointmentstoreProvider.jsx
import { create } from 'zustand';

export const useAppointmentStore = create((set, get) => ({
  availableLawyers: [],
  selectedLawyerId: null,
  availableSlots: [],
  busySlots: [],
  selectedSlot: null,
  loading: false,
  error: null,
  
  // Fetch all available lawyers
  fetchLawyers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/lawyer/available', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const data = await res.json();
      set({ 
        availableLawyers: data.lawyers || [],
        loading: false 
      });
      return data.lawyers;
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      set({ error: error.message, loading: false });
      return [];
    }
  },
  
  // Set selected lawyer
  selectLawyer: (lawyerId) => {
    set({ selectedLawyerId: lawyerId });
    // Reload availability when lawyer changes
    if (lawyerId) {
      const { viewDates } = get();
      if (viewDates) {
        get().fetchAvailability(viewDates.start, viewDates.end);
      }
    }
  },
  
  // Fetch both available and busy slots for a lawyer
  fetchAvailability: async (start, end) => {
    const { selectedLawyerId } = get();
    if (!selectedLawyerId) {
      return;
    }
    
    set({ loading: true, error: null, viewDates: { start, end } });
    
    try {
      // Fetch available slots
      const availRes = await fetch('/api/lawyer/available-slots', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          lawyerId: selectedLawyerId,
          start,
          end 
        })
      });
      
      if (!availRes.ok) {
        throw new Error(`Available slots API returned ${availRes.status}`);
      }
      const availData = await availRes.json();
      
      // Fetch busy slots
      const busyRes = await fetch('/api/lawyer/busy-slots', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          lawyerId: selectedLawyerId,
          start,
          end 
        })
      });
      
      if (!busyRes.ok) {
        throw new Error(`Busy slots API returned ${busyRes.status}`);
      }
      const busyData = await busyRes.json();
      
      set({ 
        availableSlots: availData.available || [],
        busySlots: busyData.busy || [],
        loading: false 
      });
    } catch (error) {
      console.error("Error fetching availability:", error);
      set({ 
        error: error.message, 
        loading: false,
        availableSlots: [],
        busySlots: []
      });
    }
  },
  
  // Book an appointment
  bookAppointment: async (clientId, start, end) => {
    const { selectedLawyerId } = get();
    if (!selectedLawyerId || !clientId || !start || !end) {
      set({ error: "Missing required booking information" });
      return false;
    }
    
    set({ loading: true, error: null });
    
    try {
      const res = await fetch('/api/appointments/book', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          clientId,
          lawyerId: selectedLawyerId,
          start,
          end 
        })
      });
      
      if (!res.ok) {
        throw new Error(`Booking API returned ${res.status}`);
      }
      
      const data = await res.json();
      set({ 
        selectedSlot: { start, end },
        loading: false 
      });
      
      // Refresh availability after booking
      get().fetchAvailability(get().viewDates.start, get().viewDates.end);
      
      return true;
    } catch (error) {
      console.error("Error booking appointment:", error);
      set({ error: error.message, loading: false });
      return false;
    }
  }
}));
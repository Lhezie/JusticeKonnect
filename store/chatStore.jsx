import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [], // Initialize with an empty array
  loadMessages: async ({ clientId, lawyerId }) => {
    try {
      const res = await fetch(`/api/messages?client=${clientId}&lawyer=${lawyerId}`);
      if (!res.ok) {
        throw new Error(`Failed to load messages: ${res.status}`);
      }
      const msgs = await res.json();
      set({ messages: Array.isArray(msgs) ? msgs : [] }); // Ensure array
    } catch (e) { 
      console.error("Error loading messages:", e);
      set({ messages: [] }); // Set empty array on error
    }
  },
  sendMessage: async ({ senderId, receiverId, content }) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST', 
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ senderId, receiverId, content })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.status}`);
      }
      
      const msg = await res.json();
      set((state) => ({ 
        messages: Array.isArray(state.messages) 
          ? [...state.messages, msg] 
          : [msg] 
      }));
      return msg;
    } catch (e) { 
      console.error("Error sending message:", e);
      throw e; // Re-throw to handle in component
    }
  }
}))
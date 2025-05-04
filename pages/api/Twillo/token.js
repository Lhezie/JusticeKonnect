import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  loadMessages: async ({ clientId, lawyerId }) => {
    try {
      const res = await fetch(`/api/messages?client=${clientId}&lawyer=${lawyerId}`);
      const msgs = await res.json();
      set({ messages: msgs });
    } catch (e) { console.error(e); }
  },
  sendMessage: async ({ senderId, receiverId, content }) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ senderId, receiverId, content })
      });
      const msg = await res.json();
      set((state) => ({ messages: [...state.messages, msg] }));
    } catch (e) { console.error(e); }
  }
}));
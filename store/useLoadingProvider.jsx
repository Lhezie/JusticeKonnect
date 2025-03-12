import { create } from "zustand";

const UseLoadingProvider = create((set) => ({
  loading: true, // Default loading state is true
  setLoading: (isLoading) => set({ loading: isLoading }), 
}));

export default UseLoadingProvider;

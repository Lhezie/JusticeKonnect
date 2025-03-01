import { create } from "zustand"

const UseAuthProvider = create((set) => ({

    user: null,
    setUser: (user) => set({ user }),
}));

export default UseAuthProvider;
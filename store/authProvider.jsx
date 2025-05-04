// store/useAuthProvider.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

const useAuth = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      // Set user + token after login
      setAuth: ({ user, accessToken }) => set({ user, accessToken }),

      // Refresh token and fetch user on app load
      refreshAccessToken: async () => {
        try {
          // Refresh the access token using the refresh token (cookie-based)
          const res = await fetch("/api/auth/clientrefresh", {
            method: "POST",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Could not refresh token");
          const { accessToken } = await res.json();
          set({ accessToken });

          // Now fetch user data
          const me = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          });
          if (me.ok) {
            const { user } = await me.json();
            set({ user });
          } else {
            set({ user: null });
          }
        } catch (err) {
          console.error("Refresh failed:", err);
          set({ user: null, accessToken: null });
          toast.error("Session expired. Please log in again.");
        }
      },

      // Clear auth (logout)
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: "auth-storage" }
  )
);

export default useAuth;

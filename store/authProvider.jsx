// store/useAuthProvider.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

const useAuth = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // Set user after login
      setAuth: ({ user }) => set({ user, isAuthenticated: true }),

      // Refresh/fetch user session on app load
      refreshSession: async () => {
        try {
          const res = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("User not authenticated");
          }

          const { user } = await res.json();
          set({ user, isAuthenticated: true });
        } catch (err) {
          console.error("Session refresh failed:", err);
          set({ user: null, isAuthenticated: false });
          toast.error("Session expired. Please log in again.");
        }
      },

      // Logout (clears store)
      logout: () => set({ user: null, isAuthenticated: false }),

      // Optional helper for protected fetch
      authFetch: async (url, options = {}) => {
        return fetch(url, {
          ...options,
          credentials: "include", // Include cookies in requests
        });
      },
    }),
    {
      name: "auth-storage", // Store key in localStorage
    }
  )
);

export default useAuth;

// // store/useAuthProvider.js
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { toast } from "react-toastify";

// const useAuth = create(
//   persist(
//     (set) => ({
//       user: null,
//       accessToken: null,
//       isAuthenticated: false, // Added auth status flag

//       // Set user + token after login
//       setAuth: ({ user, accessToken }) =>
//         set({ user, accessToken, isAuthenticated: true }),

//       // Refresh token and fetch user on app load
//       refreshAccessToken: async () => {
//         try {
//           // Step 1: Refresh the access token
//           const res = await fetch("/api/auth/clientrefresh", {
//             method: "POST",
//             credentials: "include",
//           });
//           if (!res.ok) {
//             throw new Error("Could not refresh token");
//           }

//           const { accessToken } = await res.json();
//           set({ accessToken }); // Temporarily store token

//           // Step 2: Fetch user data
//           const me = await fetch("/api/auth/me", {
//             method: "GET",
//             credentials: "include",
//           });

//           if (me.ok) {
//             const { user } = await me.json();
//             set({ user, isAuthenticated: true }); // Confirm login state
//           } else {
//             set({ user: null, isAuthenticated: false });
//           }
//         } catch (err) {
//           console.error("Refresh failed:", err);
//           set({ user: null, accessToken: null, isAuthenticated: false });
//           toast.error("Session expired. Please log in again.");
//         }
//       },

//       // Clear auth (logout)
//       logout: () =>
//         set({ user: null, accessToken: null, isAuthenticated: false }),

//       // Optional: Fetch helper that includes accessToken in headers
//       authFetch: async (url, options = {}) => {
//         const { accessToken } = useAuth.getState();
//         const headers = {
//           ...options.headers,
//           Authorization: `Bearer ${accessToken}`,
//         };
//         return fetch(url, { ...options, headers });
//       },
//     }),
//     {
//       name: "auth-storage", // localStorage key
//     }
//   )
// );

// export default useAuth;


// // store/useAuthProvider.js
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { toast } from "react-toastify";

// const useAuth = create(
//   persist(
//     (set) => ({
//       user: null,
//       accessToken: null,

//       // Set user + token after login
//       setAuth: ({ user, accessToken }) => set({ user, accessToken }),

//       // Refresh token and fetch user on app load
//       refreshAccessToken: async () => {
//         try {
//           // Refresh the access token using the refresh token (cookie-based)
//           const res = await fetch("/api/auth/clientrefresh", {
//             method: "POST",
//             credentials: "include",
//           });
//           if (!res.ok) {
//             throw new Error("Could not refresh token");
//           }
//           const { accessToken } = await res.json();
//           set({ accessToken });

//           // Now fetch user data
//           const me = await fetch("/api/auth/me", {
//             method: "GET",
//             credentials: "include",
//           });
//           if (me.ok) {
//             const { user } = await me.json();
//             set({ user });
//           } else {
//             set({ user: null });
//           }
//         } catch (err) {
//           console.error("Refresh failed:", err);
//           set({ user: null, accessToken: null });
//           toast.error("Session expired. Please log in again.");
//         }
//       },

//       // Clear auth (logout)
//       logout: () => set({ user: null, accessToken: null }),
//     }),
//     { name: "auth-storage" }
//   )
// );

// export default useAuth;

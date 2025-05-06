"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "../store/authProvider";
const setAuth = useAuth((state) => state.setAuth);


export default function ClientLogoutPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);

  useEffect(() => {
    const logout = async () => {
      try {
        await axios.post("/api/auth/logout", {}, { withCredentials: true });
        setAuth(null); // Clear Zustand state
        toast.success("Logged out successfully!");
        setTimeout(() => router.push("/clientLoginPage"), 2000);
      } catch (error) {
        toast.error("Logout failed. Please try again.");
      }
    };

    logout();
  }, [router, setAuth]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ToastContainer />
      <p className="text-lg font-semibold">Logging you out...</p>
    </div>
  );
}

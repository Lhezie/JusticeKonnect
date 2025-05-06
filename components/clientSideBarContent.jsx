import React, { useState, useEffect } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { RiLogoutCircleLine } from "react-icons/ri";
import { VscLaw } from "react-icons/vsc";
import { SiGotomeeting } from "react-icons/si";
import { VscCalendar } from "react-icons/vsc";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import UseAuthProvider from "../store/authProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";



export const ClientSideBarContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setAuth } = UseAuthProvider();
// const { user} = UseAuthProvider();

  return (
    <div className="">
      <div className=" flex text-sm md:text-md lg:text-md justify-center md:flex-none md:justify-start">
        {/* loggedin User name */}
        <div className=" pt-3  text-gray-800 font-semibold">Hi, </div>
        <span className="px-2 font-semibold text-gray-800 pt-3 ">
        <span>{user.fullName}</span>
        </span>
      </div>
      <div className="flex flex-col   relative ">
        {/* Main Menu */}
        <div className="flex-grow">

        <div className="pt-6">
            <div
              onClick={() => router.push("/clientDashboard")}
              className={`flex items-center py-2 px-2 hover:gradientButton ${
                pathname === "/clientDashboard" ? "py-2 px-2 gradientButton" : ""
              }`}
            >
              <VscLaw size={24} />
              <div className="pl-2">Dashboard</div>
            </div>
          </div>

          {/* New Case */}
          <div className="pt-6">
            <div
              onClick={() => router.push("/createNewCase")}
              className={`flex items-center py-2 px-2 hover:gradientButton ${
                pathname === "/createNewCase" ? "py-2 px-2 gradientButton" : ""
              }`}
            >
              <VscLaw size={24} />
              <div className="pl-2">New Case</div>
            </div>
          </div>

          {/* Appointment */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/appointment")}
              className={`flex items-center py-2 px-2 hover:gradientButton  ${
                pathname === "/appointment" ? "gradientButton" : ""
              }`}
            >
              <VscCalendar size={24} />
              <div className="pl-2">Appointment</div>
            </div>
          </div>

          {/* Settings */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/settings")}
              className={`flex items-center py-2 px-2 hover:gradientButton ${
                pathname === "/settings" ? "gradientButton" : ""
              }`}
            >
              <IoSettingsOutline size={24} />
              <div className="pl-2">Settings</div>
            </div>
          </div>

          {/* Profile */}
          <div className="pt-4 ">
            <div
              onClick={() => router.push("/profile")}
              className={`flex items-center py-2 px-2 hover:gradientButton ${
                pathname === "/profile" ? "gradientButton" : ""
              }`}
            >
              <BsPerson size={24} />
              <div className="pl-2">Profile</div>
            </div>
          </div>
        </div>
        {/* Logout - Positioned at the Bottom */}
        <div className="absolute top-[28.21rem] md:top-[31.21rem] right-[2rem] md:left-[2rem]">
          <div
            onClick={async () => {
              try {
                await axios.post("/api/auth/logout", {}, { withCredentials: true }); // Clear cookie
                setAuth({ user: null, accessToken: null });
                toast.success("Logged out successfully"); // Optional: clear Zustand state
                router.push("/clientLoginPage");  // Redirect to login
              } catch (error) {
                console.error("Logout failed:", error);
              }
            }}
            className={`flex items-center py-2 px-2 w-fit hover:gradientButton`}
          >
            <RiLogoutCircleLine size={24} />
            <div className="pl-2">Logout</div>
          </div>
        </div>
      </div>
    </div>
















  );
};
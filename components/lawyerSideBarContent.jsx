// components/lawyerSideBarContent.jsx
import React, { useState, useEffect } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { RiLogoutCircleLine } from "react-icons/ri";
import { VscLaw } from "react-icons/vsc";
import { VscCalendar } from "react-icons/vsc";
import { MdQueryStats, MdPendingActions } from "react-icons/md";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import UseAuthProvider from "../store/authProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const LawyerSideBarContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = UseAuthProvider();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="">
      <div className="flex text-sm md:text-md lg:text-md justify-center md:flex-none md:justify-start">
        {/* logged-in User name */}
        <div className="pt-3 text-gray-800 font-semibold">Hi, </div>
        <span className="px-2 font-semibold text-gray-800 pt-3 ">
          <span>{user?.fullName}</span>
        </span>
      </div>
      <div className="flex flex-col relative">
        {/* Main Menu */}
        <div className="flex-grow">
          {/* Dashboard */}
          <div className="pt-6">
            <div
              onClick={() => router.push("/lawyerDashboard")}
              className={`flex items-center py-2 px-2 hover:gradientButton ${
                pathname === "/lawyerDashboard" ? "py-2 px-2 gradientButton" : ""
              }`}
            >
              <MdQueryStats size={24} />
              <div className="pl-2">Dashboard</div>
            </div>
          </div>

          {/* Pending Cases */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/pendingCases")}
              className={`flex items-center py-2 px-2 hover:gradientButton  ${
                pathname === "/pendingCases" ? "gradientButton" : ""
              }`}
            >
              <MdPendingActions size={24} />
              <div className="pl-2">Pending Cases</div>
            </div>
          </div>

          {/* Approved Cases */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/approvedCases")}
              className={`flex items-center py-2 px-2 hover:gradientButton  ${
                pathname === "/approvedCases" ? "gradientButton" : ""
              }`}
            >
              <VscLaw size={24} />
              <div className="pl-2">Approved Cases</div>
            </div>
          </div>

          {/* Appointments */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/lawyerAppointments")}
              className={`flex items-center py-2 px-2 hover:gradientButton  ${
                pathname === "/lawyerAppointments" ? "gradientButton" : ""
              }`}
            >
              <VscCalendar size={24} />
              <div className="pl-2">Appointments</div>
            </div>
          </div>

          {/* Availability */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/manageAvailability")}
              className={`flex items-center py-2 px-2 hover:gradientButton ${
                pathname === "/manageAvailability" ? "gradientButton" : ""
              }`}
            >
              <VscCalendar size={24} />
              <div className="pl-2">Manage Availability</div>
            </div>
          </div>

          {/* Profile */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/lawyerProfile")}
              className={`flex items-center py-2 px-2 hover:gradientButton ${
                pathname === "/lawyerProfile" ? "gradientButton" : ""
              }`}
            >
              <BsPerson size={24} />
              <div className="pl-2">Profile</div>
            </div>
          </div>

          {/* Settings */}
          <div className="pt-4">
            <div
              onClick={() => router.push("/lawyerSettings")}
              className={`flex items-center py-2 px-2 hover:gradientButton ${
                pathname === "/lawyerSettings" ? "gradientButton" : ""
              }`}
            >
              <IoSettingsOutline size={24} />
              <div className="pl-2">Settings</div>
            </div>
          </div>
        </div>
        
        {/* Logout - Positioned at the Bottom */}
        <div className="absolute top-[28.21rem] md:top-[31.21rem] right-[2rem] md:left-[2rem]">
          <div
            onClick={handleLogout}
            className={`flex items-center py-2 px-2 w-fit hover:gradientButton cursor-pointer`}
          >
            <RiLogoutCircleLine size={24} />
            <div className="pl-2">Logout</div>
          </div>
        </div>
      </div>
    </div>
  );
};
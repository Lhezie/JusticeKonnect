// components/lawyerSideBarContent.jsx
import React from "react";
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

  // Define navigation items with correct paths
  const navigationItems = [
    {
      icon: MdQueryStats,
      label: "Dashboard",
      path: "/lawyerDashboard",
      activeCondition: pathname === "/lawyerDashboard"
    },
    {
      icon: MdPendingActions,
      label: "Pending Cases",
      path: "/pendingCases",
      activeCondition: pathname === "/pendingCases"
    },
    {
      icon: VscLaw,
      label: "Approved Cases",
      path: "/approvedCases",
      activeCondition: pathname === "/approvedCases"
    },
    {
      icon: VscCalendar,
      label: "Manage Availability",
      path: "/manageAvailability",
      activeCondition: pathname === "/manageAvailability"
    },
    {
      icon: VscCalendar,
      label: "Appointments",
      path: "/lawyerAppointments",
      activeCondition: pathname === "/lawyerAppointments"
    },
    {
      icon: BsPerson,
      label: "Profile",
      path: "/lawyerProfile",
      activeCondition: pathname === "/lawyerProfile"
    },
    {
      icon: IoSettingsOutline,
      label: "Settings",
      path: "/settings",
      activeCondition: pathname === "/settings"
    }
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div>
      <div className="flex text-sm md:text-md lg:text-md justify-center md:flex-none md:justify-start">
        <div className="pt-3 text-gray-800 font-semibold">Hi, </div>
        <span className="px-2 font-semibold text-gray-800 pt-3">
          <span>{user?.fullName || "Lawyer"}</span>
        </span>
      </div>
      <div className="flex flex-col relative h-full">
        <div className="flex-grow">
          {navigationItems.map((item, index) => (
            <div key={index} className="pt-4">
              <div
                onClick={() => router.push(item.path)}
                className={`flex items-center py-2 px-2 hover:gradientButton cursor-pointer ${
                  item.activeCondition ? "gradientButton" : ""
                }`}
              >
                <item.icon size={24} />
                <div className="pl-2">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Logout - Positioned at the Bottom */}
        <div className="mt-12 absolute bottom-4 left-0">
          <div
            onClick={handleLogout}
            className="flex items-center py-2 px-2 w-fit hover:gradientButton cursor-pointer"
          >
            <RiLogoutCircleLine size={24} />
            <div className="pl-2">Logout</div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
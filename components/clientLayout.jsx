import React from "react";
import { ClientNavBar } from "./clientNavBar";
import { ClientSideBarContent } from "./clientSideBarContent";

const ClientLayout = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-blue-50">
      {/* Navbar - Fixed at the Top */}
      <div className="fixed w-full top-0 left-0 z-50 bg-white shadow-md">
        <ClientNavBar />
      </div>

      {/* Main Layout Wrapper */}
      <div className="flex flex-1 pt-[4rem] h-full">
        {/* Sidebar (Desktop View) */}
        <div className="hidden md:block w-[22%] bg-blue-100 h-full">
          <div className="p-4">
            <ClientSideBarContent />
          </div>
        </div>

        {/* Main Content Area with Scroll */}
        <div className="flex-1 p-4 overflow-auto h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;

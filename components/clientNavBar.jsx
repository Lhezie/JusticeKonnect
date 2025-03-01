import React from "react";
import Image from "next/image";
import { IoNotificationsOutline } from "react-icons/io5";
import ClientSideBar from "./clientSideBar";

export const ClientNavBar = () => {
  return (
    <div>
      {/* Drawer Wrapper */}
      <div className="drawer drawer-end ">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

        {/* NAVBAR CONTENT */}
        <div className="drawer-content">
          <div className="navbar bg-blue-400">
            {/* hamburger */}
            <div className="flex-1">
              {/* Connect to the drawer */}
              <label
                htmlFor="my-drawer-4"
                className=" drawer-button block md:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </label>
              {/* logo */}
              <div className="italic font-inter font-light text-sm md:texl-xl md:font-bold">
                JusticeConnect
              </div>
            </div>

            <div className="flex-none flex items-center gap-2">
              {/* settings */}
              
              {/* notification */}
              <IoNotificationsOutline className="text-xl md:text-2xl lg:text-3xl text-blue-900" />
              {/* profile picture */}
              <div className="w-[2rem] h-[2rem] md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
                <img
                  src="/lucas-lenzi-2RwB3AHphb4-unsplash.jpg"
                  alt="Logo"
                  className="object-cover w-10 h-10 md:w-12 md:h-12 "
                />
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR CONTENT */}
        <div className="drawer-side  over">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ClientSideBar />
        </div>
      </div>
    </div>
  );
};

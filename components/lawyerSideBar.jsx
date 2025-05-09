// components/lawyerSideBar.jsx
import React from "react";
import Image from "next/image";
import { LawyerSideBarContent } from "./lawyerSideBarContent";

const LawyerSideBar = () => {
  return (
    <>
      <ul className="menu bg-blue-400 min-h-full w-80 p-4 text-black font-inter overflow-none">
        {/* logo */}
        <div className="flex justify-center my-6">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-white">
            <Image
              src="/LogoOnee.png"
              width={96}
              height={96}
              alt="Logo"
              className="object-contain"
            />
          </div>
        </div>

        {/* sideBar Pages Content */}
        <LawyerSideBarContent />
      </ul>
    </>
  );
};

export default LawyerSideBar;
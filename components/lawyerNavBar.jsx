"use client";
import React, { useState } from "react";
import Image from "next/image";
import { IoNotificationsOutline } from "react-icons/io5";
import LawyerSideBar from "./lawyerSideBar";
import UseAuthProvider from "../store/authProvider";

export const LawyerNavBar = () => {
  const { user } = UseAuthProvider();
  const [imgSrc, setImgSrc] = useState("/lawyer-profile.jpg"); // Initial profile pic

  return (
    <div>
      {/* Drawer Wrapper */}
      <div className="drawer drawer-end">
        <input id="lawyer-drawer" type="checkbox" className="drawer-toggle" />

        {/* NAVBAR CONTENT */}
        <div className="drawer-content">
          <div className="navbar bg-blue-400">
            {/* hamburger */}
            <div className="flex-1">
              <label
                htmlFor="lawyer-drawer"
                className="drawer-button block md:hidden"
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
              <div className="italic font-inter font-light text-sm md:text-xl md:font-bold">
                JusticeConnect
                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  Lawyer
                </span>
              </div>
            </div>

            <div className="flex-none flex items-center gap-2">
              {/* notification */}
              <IoNotificationsOutline className="text-xl md:text-2xl lg:text-3xl text-blue-900" />

              {/* profile information */}
              <div className="flex items-center">
                {user && (
                  <div className="mr-2 text-right hidden md:block">
                    <div className="font-semibold">{user.fullName}</div>
                    <div className="text-xs">{user.specialty}</div>
                  </div>
                )}

                {/* profile picture */}
                <div className="w-[2rem] h-[2rem] md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg relative">
                  <Image
                    src={imgSrc}
                    alt="Lawyer profile"
                    layout="fill"
                    objectFit="cover"
                    onError={() => setImgSrc("https://via.placeholder.com/48?text=L")}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR CONTENT */}
        <div className="drawer-side z-50">
          <label
            htmlFor="lawyer-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <LawyerSideBar />
        </div>
      </div>
    </div>
  );
};

// // components/lawyerNavBar.jsx
// import React from "react";
// import Image from "next/image";
// import { IoNotificationsOutline } from "react-icons/io5";
// import LawyerSideBar from "./lawyerSideBar";
// import UseAuthProvider from "../store/authProvider";

// export const LawyerNavBar = () => {
//   const { user } = UseAuthProvider();
  
//   return (
//     <div>
//       {/* Drawer Wrapper */}
//       <div className="drawer drawer-end">
//         <input id="lawyer-drawer" type="checkbox" className="drawer-toggle" />

//         {/* NAVBAR CONTENT */}
//         <div className="drawer-content">
//           <div className="navbar bg-blue-400">
//             {/* hamburger */}
//             <div className="flex-1">
//               {/* Connect to the drawer */}
//               <label
//                 htmlFor="lawyer-drawer"
//                 className="drawer-button block md:hidden"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M4 6h16M4 12h16M4 18h7"
//                   />
//                 </svg>
//               </label>
//               {/* logo */}
//               <div className="italic font-inter font-light text-sm md:texl-xl md:font-bold">
//                 JusticeConnect
//                 <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Lawyer</span>
//               </div>
//             </div>

//             <div className="flex-none flex items-center gap-2">
//               {/* notification */}
//               <IoNotificationsOutline className="text-xl md:text-2xl lg:text-3xl text-blue-900" />
              
//               {/* profile information */}
//               <div className="flex items-center">
//                 {user && (
//                   <div className="mr-2 text-right hidden md:block">
//                     <div className="font-semibold">{user.fullName}</div>
//                     <div className="text-xs">{user.specialty}</div>
//                   </div>
//                 )}
                
//                 {/* profile picture */}
//                 <div className="w-[2rem] h-[2rem] md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
//                   <img
//                     src="/lawyer-profile.jpg" // Replace with actual profile pic
//                     alt="Profile"
//                     className="object-cover w-10 h-10 md:w-12 md:h-12"
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = "https://via.placeholder.com/48?text=L";
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* SIDEBAR CONTENT */}
//         <div className="drawer-side z-50">
//           <label
//             htmlFor="lawyer-drawer"
//             aria-label="close sidebar"
//             className="drawer-overlay"
//           ></label>
//           <LawyerSideBar />
//         </div>
//       </div>
//     </div>
//   );
// };
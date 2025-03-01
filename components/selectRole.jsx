"use client"; // Ensures client-side rendering

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaFacebook,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SelectRole() {
  const router = useRouter();

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-center items-center min-h-screen h-fit px-4 ">
        <div className="w-full max-w-md p-6 rounded-xl shadow-lg">
          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
              <Image
                src="/LogoOnee.png"
                width={96}
                height={96}
                alt="Logo"
                className="object-contain"
              />
            </div>
          </div>

          {/* <h2 className="text-center text-2xl font-semibold mb-4">Login</h2> */}

          {/* TABS */}
          {/* <div className="flex justify-between mb-4 text-lg font-semibold relative border-b border-gray-300">
            <button
          
              className={`w-1/2 text-center pb-2 relative ${isSignup ? "text-black font-bold" : "text-gray-500"}`}
            >
              SIGN UP
             <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
            </button>

            <button
     
              className={`w-1/2 text-center pb-2 relative ${!isSignup ? "text-black font-bold" : "text-gray-500"}`}
            >
              LOGIN
             <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
            </button>
          </div> */}

          {/* Submit Button */}
          <div className="pb-12 px-6">
            <button
              onClick={(()=>{router.push("/clientRegisterPage")})}
              type="submit"
              className="w-full bg-blue-400 text-white p-3 rounded-xl font-semibold"
            >
              Sign Up As A Client
            </button>
          </div>

          <div className="pb-12 px-6">
                      <button
                          onClick={(()=>{router.push("/professionalsLoginPage")})}
              type="submit"
              className="w-full bg-blue-400 px-6 text-white p-3 rounded-xl font-semibold"
            >
              Sign Up As A Lawyer
            </button>
          </div>

          <div className="text-center">
                      Already have an Account?<span className="text-blue-400">Login!</span>
                      <div className="flex justify-between px-24">
                          <div className="text-start underline text-blue-400 italic text-sm cursor-pointer">Client</div>
                          <div className="text-end underline text-blue-400 italic text-sm cursor-pointer">Lawyer</div>
                      </div>
          </div>
        </div>
      </div>
    </div>
  );
}

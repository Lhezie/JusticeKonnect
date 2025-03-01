"use client"; // Ensure it runs only on the client side

import React, { useState, useEffect } from "react";
import { FaBeer } from "react-icons/fa";

export default function LightDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    // <button onClick={() => setDarkMode(!darkMode)} className="p-2">
    //   <FaBeer className="w-10 h-10 text-yellow-500 cursor-pointer" />
    // </button>
    <div></div>
  );
}

import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { FaBeer } from "react-icons/fa";
import { useEffect, useState } from "react"
// import { RegisterPage } from "../components/registerPage";


import dynamic from "next/dynamic";

const LightDarkMode = dynamic(() => import("../components/lightDarkMode.jsx"), {
  ssr: false, // 👈 This prevents SSR
});



const SelectRole = dynamic(() => import("../components/selectRole.jsx"), {
  ssr: false, // 👈 This prevents SSR
});

export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden bg-blue-50">
      <LightDarkMode />
      <SelectRole/>
      
    </div>
  );
}

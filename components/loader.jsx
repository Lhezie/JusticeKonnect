"use client"; // Ensures client-side rendering

import Image from "next/image";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="w-32 h-32 flex items-center justify-center rounded-full bg-blue-100 animate-pulse">
        <Image
          src="/LogoOnee.png" // Ensure this image exists in /public
          width={80}
          height={80}
          alt="Justice Connect Logo"
          className="object-contain"
        />
      </div>
    </div>
  );
}

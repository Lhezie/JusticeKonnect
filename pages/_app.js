import "../styles/globals.css";
import "daisyui/dist/full.css";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import UseLoadingProvider from "../store/UseLoadingProvider"; // Zustand store
import UseAuthProvider from "../store/authProvider"; // Zustand store

// Dynamically import Loader with SSR disabled
const Loader = dynamic(() => import("../components/loader.jsx"), { ssr: false });

function MyApp({ Component, pageProps }) {
  const { loading, setLoading } = UseLoadingProvider();
  const {user, setUser} = UseAuthProvider(); // New state to check if the component has mounted

  useEffect(() => {
    setUser(true); // Ensure client-side rendering is active
    setLoading(true); // Set loading state
    setTimeout(() => setLoading(false), 2000); // Simulate loading
  }, [setLoading]);

  // Prevent rendering until useEffect has run (fix hydration issue)
  if (!user) return null;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {loading && <Loader />}
      {!loading && <Component {...pageProps} />}
    </div>
  );
}

export default MyApp;

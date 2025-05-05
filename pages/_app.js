import "../styles/globals.css";
import "daisyui/dist/full.css";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useAuth from "../store/authProvider.jsx";  // ✅ Make sure this matches your store filename!

// Dynamically import Loader with SSR disabled
const Loader = dynamic(() => import("../components/loader.jsx"), { ssr: false });

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const refreshAccessToken = useAuth((state) => state.refreshAccessToken);  // ✅ at the top!

  useEffect(() => {
    const init = async () => {
      await refreshAccessToken();
      setLoading(false);
    };
    init();
  }, [refreshAccessToken]);

  if (loading) {
    return <Loader />;
  }

  return <Component {...pageProps} />;
}


export default MyApp;

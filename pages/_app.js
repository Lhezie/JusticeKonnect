import "../styles/globals.css";
import "daisyui/dist/full.css";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useAuth from "../store/authProvider.jsx";  
import { useRouter } from "next/router";  //  Needed for redirect

// Dynamically import Loader with SSR disabled
const Loader = dynamic(() => import("../components/loader.jsx"), { ssr: false });

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const refreshSession = useAuth((state) => state.refreshSession);
  const router = useRouter();  // Initialize router

  useEffect(() => {
    const publicRoutes = ["/clientLoginPage", "/clientRegisterPage"];
  
    if (publicRoutes.includes(router.pathname)) {
      setLoading(false); // Don’t block rendering on public pages
      return;
    }
  
    const init = async () => {
      try {
        await refreshSession();
      } catch (err) {
        console.warn("Token refresh failed", err);
        router.push("/clientLoginPage");
      } finally {
        setLoading(false);
      }
    };
  
    init();
  }, [refreshSession, router]);
  
  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       await refreshAccessToken();
  //     } catch (err) {
  //       console.warn("Token refresh failed", err);
  //       // Optional: redirect to login page if refresh fails
  //       router.push("/clientLoginPage");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   init();
  // }, [refreshAccessToken, router]);

  if (loading) {
    return <Loader />;
  }

  return <Component {...pageProps} />;
}

export default MyApp;


// import "../styles/globals.css";
// import "daisyui/dist/full.css";
// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import useAuth from "../store/authProvider.jsx";  // 

// // Dynamically import Loader with SSR disabled
// const Loader = dynamic(() => import("../components/loader.jsx"), { ssr: false });

// function MyApp({ Component, pageProps }) {
//   const [loading, setLoading] = useState(true);
//   const refreshAccessToken = useAuth((state) => state.refreshAccessToken);  // ✅ at the top!

//   useEffect(() => {
//     const init = async () => {
//          await refreshAccessToken();
//       setLoading(false);
//     };
//     init();
//   }, [refreshAccessToken]);

//   if (loading) {
//     return <Loader />;
//   }

//   return <Component {...pageProps} />;
// }


// export default MyApp;

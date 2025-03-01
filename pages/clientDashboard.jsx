import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAuthProvider from "../store/authProvider";// Import the Case Provider
import { Formateddate } from "../utils/date";
import ClientLayout from "../components/clientLayout";
import { useRouter } from "next/navigation";
import Loader from "../components/loader";
import UseClientDashboardProvider from "../store/useclientDashboardProvider"

const ClientDashboard = () => {
  const { user, setUser } = UseAuthProvider();
  const { caseOverviewData } = UseClientDashboardProvider(); // Get case data from Zustand
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("./api/auth/me", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (data?.user) {
          setUser(data.user);
          setLoading(false);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router, setUser]);

  if (loading) return <Loader />;

  return (
    <ClientLayout>
      <div className="text-sm md:text-md lg:text-md">
        <div className="text-end">
          <Formateddate />
        </div>

        <div className="mt-2">
          Hi, <span className="font-bold">{user?.fullName}</span>
        </div>
        <div className="pt-2 text-lg font-semibold">Case Overview</div>

        {/* Case Overview Cards */}
        <div className="grid grid-cols-3 gap-2 mt-4 justify-center">
          {caseOverviewData.map((item, index) => (
            <div
              key={index}
              className={`relative px- py-6 rounded-xl text-center flex flex-col items-center justify-center transition-all duration-300
                ${item.active ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              <p className="text-sm md:text-md lg:text-md font-medium">{item.label}</p>
              <p className="absolute bottom-2 right-4 text-sm md:text-md lg:text-md font-bold">
                {item.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;

// pages/clientDashboard.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "../store/authProvider"; // Correct import based on your actual file
import { Formateddate } from "../utils/date";
import { ClientLayout } from "../components/ClientLayout"; // Make sure casing is consistent
import { useRouter } from "next/navigation";
import Loader from "../components/loader";
import TestimonialCarousel from "../components/TestimonialCarousel";

import QuickActions from "../components/QuickActions";// Ensure this path is correct


const ClientDashboard = () => {
  // Use your auth store correctly
  const { user, setAuth, refreshAccessToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [caseStats, setCaseStats] = useState({
    submitted: 0,
    underReview: 0,
    approved: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use your auth store's refreshAccessToken function to get the latest user data
        await refreshAccessToken();

        // If we have a user after refresh, fetch case statistics
        if (user?.id) {
          fetchCaseStatistics(user.id);
        } else {
          // If no user after refresh, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/login");
      }
    };

    fetchUserData();
  }, [refreshAccessToken, router]);

  // This useEffect watches for user changes and fetches case stats when user exists
  useEffect(() => {
    if (user?.id) {
      fetchCaseStatistics(user.id);
    }
  }, [user]);

  // Function to fetch case statistics for the logged-in user
  const fetchCaseStatistics = async (userId) => {
    try {
      const response = await fetch(`/api/cases/stats?userId=${userId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setCaseStats({
          submitted: data.submitted || 0,
          underReview: data.underReview || 0,
          approved: data.approved || 0,
        });
      } else {
        console.error("Failed to fetch case statistics");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching case statistics:", error);
      setLoading(false);
    }
  };

  // Case overview data with dynamic counts
  const caseOverviewData = [
    {
      label: "Submitted Cases",
      count: caseStats.submitted,
      active: true,
    },
    {
      label: "Cases Under Review",
      count: caseStats.underReview,
      active: false,
    },
    {
      label: "Approved Cases",
      count: caseStats.approved,
      active: false,
    },
  ];

  const testimonials = [
    {
      id: 1,
      text: "I am glad I came in contact with Justice Connect...",
      author: "Jane Doe, 41 Abuja",
      avatar: "https://via.placeholder.com/50",
    },
    {
      id: 2,
      text: "I am glad I came in contact with Justice Connect...",
      author: "Jane Doe, 41 Abuja",
      avatar: "https://via.placeholder.com/50",
    },
    {
      id: 3,
      text: "I am glad I came in contact with Justice Connect...",
      author: "Jane Doe, 41 Abuja",
      avatar: "https://via.placeholder.com/50",
    },
  ];

  if (loading) return <Loader />;

  return (
    <ClientLayout clientId={user?.id}>
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
              <p className="text-sm md:text-md lg:text-md font-medium">
                {item.label}
              </p>
              <p className="absolute bottom-2 right-4 text-sm md:text-md lg:text-md font-bold">
                {item.count}
              </p>
            </div>
          ))}
        </div>
        <TestimonialCarousel />

        <QuickActions />
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;

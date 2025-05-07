// pages/clientDashboard.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "../store/authProvider";
import { Formateddate } from "../utils/date";
import { ClientLayout } from "../components/clientLayout";
import { useRouter } from "next/navigation";
import Loader from "../components/loader";
import TestimonialCarousel from "../components/testimonialCarousel";

import QuickActions from "../components/quickActions"; 

const ClientDashboard = () => {
  // Use your auth store correctly
  const { user, setAuth, refreshAccessToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignedLawyer, setAssignedLawyer] = useState(null);

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

  const fetchAssignedLawyer = async () => {
    try {
      const response = await fetch("/api/client/assigned-lawyer", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignedLawyer(data.lawyer);
      } else {
        console.log("No lawyer assigned yet.");
        setAssignedLawyer(null);
      }
    } catch (error) {
      console.error("Error fetching assigned lawyer:", error);
      setAssignedLawyer(null);
    }
  };

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

  useEffect(() => {
    if (user?.id) {
      console.log("Fetching assigned lawyer...");
      fetchAssignedLawyer();
      fetchCaseStatistics(user.id);
    }
  }, [user?.id]);
  

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
      text: "Justice Connect provided exceptional legal support during a challenging time. Their dedication and expertise were invaluable.",
      author: "Emily R., 34, London",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
    },
    {
      id: 2,
      text: "The team at Justice Connect was compassionate and thorough. I felt supported every step of the way.",
      author: "Michael T., 45, Manchester",
      avatar: "https://images.unsplash.com/photo-1502767089025-6572583495b9"
    },
    {
      id: 3,
      text: "I highly recommend Justice Connect. Their professionalism and attention to detail made all the difference.",
      author: "Sophia L., 29, Birmingham",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
    },
    {
      id: 4,
      text: "Thanks to Justice Connect, I navigated my legal issues with confidence. Their guidance was top-notch.",
      author: "David K., 52, Leeds",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
    },
    {
      id: 5,
      text: "The attorneys at Justice Connect are knowledgeable and approachable. They made a complex process understandable.",
      author: "Olivia M., 38, Glasgow",
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
    },
    {
      id: 6,
      text: "Justice Connect exceeded my expectations. Their commitment to my case was evident from day one.",
      author: "James S., 41, Bristol",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12"
    },
    {
      id: 7,
      text: "I felt heard and respected throughout my experience with Justice Connect. Their service is unparalleled.",
      author: "Chloe W., 27, Sheffield",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
    },
    {
      id: 8,
      text: "Professional, efficient, and empathetic—Justice Connect embodies all these qualities and more.",
      author: "Liam H., 36, Liverpool",
      avatar: "https://images.unsplash.com/photo-1502767089025-6572583495b9"
    },
    {
      id: 9,
      text: "Navigating legal matters was less daunting with Justice Connect by my side. Their support was crucial.",
      author: "Isabella D., 31, Nottingham",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
    },
    {
      id: 10,
      text: "Justice Connect's team is outstanding. Their dedication to clients is truly commendable.",
      author: "Ethan B., 47, Edinburgh",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
    }
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

        {assignedLawyer ? (
          <div className="mt-4 p-4 bg-green-100 rounded-lg text-green-800 shadow">
            <p className="text-sm md:text-md lg:text-md font-semibold">
              Your Assigned Lawyer:
            </p>
            <p className="text-md md:text-lg lg:text-lg font-bold">
              {assignedLawyer.fullName}
            </p>
            <p className="text-xs md:text-sm lg:text-sm">
              {assignedLawyer.email}
            </p>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg text-yellow-800 shadow">
            <p className="text-sm md:text-md lg:text-md font-semibold">
              No lawyer has been assigned to your cases yet.
            </p>
          </div>
        )}

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

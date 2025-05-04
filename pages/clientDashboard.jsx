// pages/clientDashboard.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAuthProvider from "../store/authProvider";
import { Formateddate } from "../utils/date";
import { ClientLayout } from "../components/clientLayout";
import { useRouter } from "next/navigation";
import Loader from "../components/loader";
import TestimonialCarousel from "../components/testimonialCarousel";
import QuickActions from "../components/quickActions";

const ClientDashboard = () => {
  const { user } = UseAuthProvider();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [caseOverviewData, setCaseOverviewData] = useState([
    { label: "Submitted Cases", count: 0, active: true },
    { label: "Cases Under Review", count: 0, active: false },
    { label: "Approved Cases", count: 0, active: false }
  ]);
  const [assignedLawyer, setAssignedLawyer] = useState(null);
  const [recentCase, setRecentCase] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/clientLoginPage");
      return;
    }

    async function fetchClientData() {
      try {
        setLoading(true);
        
        // Fetch cases statistics
        const statsResponse = await fetch('/api/client/case-stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!statsResponse.ok) {
          throw new Error(`API returned ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        
        // Update case overview data with real stats
        setCaseOverviewData([
          { label: "Submitted Cases", count: statsData.submittedCount || 0, active: true },
          { label: "Cases Under Review", count: statsData.pendingCount || 0, active: false },
          { label: "Approved Cases", count: statsData.approvedCount || 0, active: false }
        ]);
        
        // Fetch assigned lawyer and most recent case
        const caseResponse = await fetch('/api/client/case-lawyer', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        // If we get a successful response, update lawyer and case data
        if (caseResponse.ok) {
          const caseData = await caseResponse.json();
          
          if (caseData.success) {
            setAssignedLawyer(caseData.lawyer || null);
            setRecentCase(caseData.case || null);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching client data:", error);
        
        // Set default values if API fails
        setCaseOverviewData([
          { label: "Submitted Cases", count: 0, active: true },
          { label: "Cases Under Review", count: 0, active: false },
          { label: "Approved Cases", count: 0, active: false }
        ]);
        
        setLoading(false);
      }
    }

    fetchClientData();
  }, [user, router]);

  if (loading) return <Loader />;

  if (!user) {
    // Redirect to login if no user - handled in useEffect
    return <Loader />;
  }

  return (
    <ClientLayout>
      <div className="text-sm md:text-md lg:text-md">
        <ToastContainer />
        <div className="text-end">
          <Formateddate />
        </div>

        <div className="mt-2 block md:hidden">
          <span className="font-bold">Welcome, {user?.fullName}</span>
        </div>
        
        <div className="pt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-md md:text-lg font-semibold">Case Overview</h2>
            {recentCase && (
              <span className="text-sm text-blue-500 cursor-pointer hover:underline" 
                onClick={() => router.push(`/case/${recentCase.id}`)}>
                View Latest Case
              </span>
            )}
          </div>
          
          {/* Case Overview Cards */}
          <div className="grid grid-cols-3 gap-2 mt-4 justify-center">
            {caseOverviewData.map((item, index) => (
              <div
                key={index}
                className={`relative text-sm md:text-md lg:text-md px-4 py-6 rounded-xl text-center flex flex-col items-center justify-center transition-all duration-300
                  ${item.active ? "bg-blue-400 text-white" : "bg-gray-200"}`}
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
        </div>
        
        {/* Assigned Lawyer Section - Only shown if there's an assigned lawyer */}
        {assignedLawyer && (
          <div className="mt-6">
            <h2 className="text-md md:text-lg font-semibold">Your Assigned Lawyer</h2>
            <div className="mt-2 bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{assignedLawyer.name}</h3>
                  <p className="text-sm text-gray-600">{assignedLawyer.specialty}</p>
                  {assignedLawyer.organization && (
                    <p className="text-xs text-gray-500 mt-1">{assignedLawyer.organization}</p>
                  )}
                </div>
                <div className="text-right">
                  <button
                    onClick={() => router.push("/appointment")}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
              {recentCase && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium">Active Case: {recentCase.title}</p>
                  <p className="text-xs text-gray-500">Status: {recentCase.status.charAt(0).toUpperCase() + recentCase.status.slice(1)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <TestimonialCarousel />

        <QuickActions />
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
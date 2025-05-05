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
  const [lawyerAvailability, setLawyerAvailability] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/clientLoginPage");
      return;
    }

    // Check if we should force a refresh from the URL
    const params = new URLSearchParams(window.location.search);
    const shouldRefresh = params.get('refresh') === 'true';
    
    // If we're forcing a refresh, clean up the URL
    if (shouldRefresh) {
      // Update URL without the query parameter but don't trigger a page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Show a toast notification to confirm submission
      toast.success("Case submitted successfully. Your dashboard has been updated.");
    }

    async function fetchClientData() {
      try {
        setLoading(true);
        
        // Fetch cases statistics
        try {
          const statsResponse = await fetch('/api/client/case-stats', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            
            // Update case overview data with real stats from database
            setCaseOverviewData([
              { label: "Submitted Cases", count: statsData.submittedCount || 0, active: true },
              { label: "Cases Under Review", count: statsData.pendingCount || 0, active: false },
              { label: "Approved Cases", count: statsData.approvedCount || 0, active: false }
            ]);
          } else {
            console.warn("Stats API returned status:", statsResponse.status);
          }
        } catch (statsError) {
          console.error("Error fetching case stats:", statsError);
        }
        
        // Fetch assigned lawyer and most recent case
        try {
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
              setRecentCase(caseData.case || null);
              
              if (caseData.lawyer) {
                setAssignedLawyer(caseData.lawyer);
                
                // Set lawyer availability if provided
                if (caseData.lawyer.availability && Array.isArray(caseData.lawyer.availability)) {
                  setLawyerAvailability(caseData.lawyer.availability);
                }
              }
            }
          } else {
            console.warn("Case-lawyer API returned status:", caseResponse.status);
          }
        } catch (caseError) {
          console.error("Error fetching lawyer and case info:", caseError);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchClientData:", error);
        setLoading(false);
      }
    }

    fetchClientData();
  }, [user, router]);

  // Function to book an appointment
  const bookAppointment = async (availabilityId) => {
    if (!recentCase || !availabilityId) {
      return;
    }
    
    try {
      const response = await fetch('/api/client/book-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          availabilityId,
          caseId: recentCase.id
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Appointment booked successfully!');
        
        // Update availability to show it's booked
        setLawyerAvailability(prev => 
          prev.map(slot => 
            slot.id === availabilityId 
              ? { ...slot, isBooked: true } 
              : slot
          )
        );
      } else {
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('An error occurred while booking the appointment');
    }
  };

  // Format date and time for display
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return <Loader />;
  }

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
                    View All Appointments
                  </button>
                </div>
              </div>
              {recentCase && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium">Active Case: {recentCase.title}</p>
                  <p className="text-xs text-gray-500">Status: {recentCase.status.charAt(0).toUpperCase() + recentCase.status.slice(1)}</p>
                </div>
              )}
              
              {/* Lawyer Availability Section */}
              {lawyerAvailability && lawyerAvailability.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Available Appointment Slots</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {lawyerAvailability.map(slot => (
                      <div 
                        key={slot.id} 
                        className={`p-2 rounded-md text-xs flex justify-between items-center
                          ${slot.isBooked 
                            ? 'bg-gray-100 text-gray-500' 
                            : 'bg-blue-50 text-blue-700'}`}
                      >
                        <span>{formatDateTime(slot.startTime)}</span>
                        {slot.isBooked ? 
                                                   <span className="text-xs font-medium">Booked</span>
                                                  : 
                                                   <button
                                                     onClick={() => bookAppointment(slot.id)}
                                                     className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                                   >
                                                     Book
                                                   </button>}
                      </div>
                    ))}
                  </div>
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
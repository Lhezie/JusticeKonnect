// pages/lawyerDashboard.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useLawyerAuth from "../store/useLawyerAuthProvider";
import LawyerLayout from "../components/lawyerlayout";
import { useRouter } from "next/navigation";
import Loader from "../components/loader";
import { FaGavel, FaCalendarAlt, FaUser, FaComment } from "react-icons/fa";

const LawyerDashboard = () => {
  const { user, refreshAccessToken } = useLawyerAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [caseStats, setCaseStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0
  });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use the auth store's refreshAccessToken function to get the latest user data
        await refreshAccessToken();
        
        // If we have a user after refresh, fetch case statistics
        if (user?.id) {
          fetchLawyerData(user.id);
        } else {
          // If no user after refresh, redirect to login
          router.push("/lawyerLoginPage");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/lawyerLoginPage");
      }
    };

    fetchUserData();
  }, [refreshAccessToken, router]);

  // This useEffect watches for user changes and fetches data when user exists
  useEffect(() => {
    if (user?.id) {
      fetchLawyerData(user.id);
    }
  }, [user]);

  // Function to fetch all lawyer data 
  const fetchLawyerData = async (userId) => {
    try {
      // Fetch case statistics for the lawyer
      const casesResponse = await fetch(`/api/lawyer/cases/stats?userId=${userId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (casesResponse.ok) {
        const data = await casesResponse.json();
        setCaseStats({
          assigned: data.assigned || 0,
          inProgress: data.inProgress || 0, 
          completed: data.completed || 0
        });
      }

      // Fetch upcoming appointments
      const appointmentsResponse = await fetch(`/api/lawyer/appointments?userId=${userId}&limit=5`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (appointmentsResponse.ok) {
        const data = await appointmentsResponse.json();
        setAppointments(data.appointments || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching lawyer data:", error);
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const caseOverviewData = [
    { 
      label: "Assigned Cases", 
      count: caseStats.assigned, 
      icon: <FaGavel className="text-blue-500" />,
      color: "bg-blue-100"
    },
    { 
      label: "In Progress", 
      count: caseStats.inProgress, 
      icon: <FaGavel className="text-yellow-500" />,
      color: "bg-yellow-100"
    },
    { 
      label: "Completed Cases", 
      count: caseStats.completed, 
      icon: <FaGavel className="text-green-500" />,
      color: "bg-green-100"
    },
  ];

  // Mock recent activities for demonstration
  const recentActivities = [
    { type: 'case_update', text: 'Case #1245 status updated to "In Review"', time: '2 hours ago' },
    { type: 'document', text: 'New document uploaded for Case #1245', time: '4 hours ago' },
    { type: 'message', text: 'New message from John Doe', time: '5 hours ago' },
    { type: 'appointment', text: 'Appointment scheduled with Jane Smith', time: '1 day ago' },
    { type: 'case_assigned', text: 'New case assigned to you', time: '2 days ago' },
  ];

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    switch(action) {
      case 'view_cases':
        router.push('/lawyerCases');
        break;
      case 'schedule':
        router.push('/lawyerAppointments');
        break;
      case 'clients':
        router.push('/lawyerClients');
        break;
      case 'messages':
        // Maybe open chat window
        break;
      default:
        break;
    }
  };

  if (loading) return <Loader />;

  return (
    <LawyerLayout lawyerId={user?.id}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>
          <p className="text-gray-500">{new Date().toDateString()}</p>
        </div>

        {/* Case Overview */}
        <h2 className="text-xl font-semibold mb-4">Case Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {caseOverviewData.map((item, index) => (
            <div
              key={index}
              className={`${item.color} p-6 rounded-lg shadow-sm flex items-center justify-between`}
            >
              <div>
                <p className="text-gray-600 font-medium">{item.label}</p>
                <p className="text-3xl font-bold">{item.count}</p>
              </div>
              <div className="text-3xl">{item.icon}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment, index) => (
                  <div key={index} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{appointment.clientName}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.start)} at {formatTime(appointment.start)}
                        </p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded">
                        {formatTime(appointment.start)} - {formatTime(appointment.end)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No upcoming appointments</p>
            )}
            <button
              onClick={() => router.push('/lawyerAppointments')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              View all appointments →
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start py-3 border-b last:border-0">
                <div className="mr-3">
                  {activity.type === 'case_update' || activity.type === 'case_assigned' ? (
                    <FaGavel className="text-blue-500" />
                  ) : activity.type === 'appointment' ? (
                    <FaCalendarAlt className="text-green-500" />
                  ) : activity.type === 'message' ? (
                    <FaComment className="text-yellow-500" />
                  ) : (
                    <FaUser className="text-purple-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => handleQuickAction('view_cases')}
            className="bg-blue-500 text-white p-4 rounded-lg shadow-sm hover:bg-blue-600 transition"
          >
            View My Cases
          </button>
          <button 
            onClick={() => handleQuickAction('schedule')}
            className="bg-green-500 text-white p-4 rounded-lg shadow-sm hover:bg-green-600 transition"
          >
            Schedule Appointment
          </button>
          <button 
            onClick={() => handleQuickAction('clients')}
            className="bg-purple-500 text-white p-4 rounded-lg shadow-sm hover:bg-purple-600 transition"
          >
            View Clients
          </button>
          <button 
            onClick={() => handleQuickAction('messages')}
            className="bg-yellow-500 text-white p-4 rounded-lg shadow-sm hover:bg-yellow-600 transition"
          >
            Check Messages
          </button>
        </div>
      </div>
    </LawyerLayout>
  );
};

export default LawyerDashboard;
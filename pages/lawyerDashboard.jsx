// pages/lawyerDashboard.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAuthProvider from "../store/authProvider";
import { Formateddate } from "../utils/date";
import { LawyerLayout } from "../components/lawyerLayout";
import { useRouter } from "next/navigation";
import Loader from "../components/loader";

const LawyerDashboard = () => {
  const { user } = UseAuthProvider();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
    upcomingAppointments: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pendingCases, setPendingCases] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/lawyerLoginPage");
      return;
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch upcoming appointments and pending cases from the API
        const response = await fetch('/api/lawyer/upcoming-appointments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        
        // Set appointments
        setUpcomingAppointments(data.upcomingAppointments || []);
        
        // Set pending cases
        setPendingCases(data.pendingCases || []);
        
        // Calculate stats
        setStats({
          totalCases: (data.totalCases || 0),
          activeCases: (data.activeCases || 0),
          completedCases: (data.completedCases || 0),
          upcomingAppointments: (data.upcomingAppointments || []).length
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        
        // Set empty data in case of error
        setUpcomingAppointments([]);
        setPendingCases([]);
        setStats({
          totalCases: 0,
          activeCases: 0,
          completedCases: 0,
          upcomingAppointments: 0
        });
        
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, router]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApproveCase = async (caseId) => {
    try {
      const response = await fetch('/api/lawyer/approve-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      toast.success("Case approved successfully");
      
      // Remove the approved case from pending cases
      setPendingCases(pendingCases.filter(c => c.id !== caseId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeCases: prev.activeCases + 1
      }));
      
    } catch (error) {
      console.error("Error approving case:", error);
      toast.error("Failed to approve case");
    }
  };

  const handleRejectCase = async (caseId) => {
    try {
      const response = await fetch('/api/lawyer/reject-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      toast.success("Case rejected");
      
      // Remove the rejected case from pending cases
      setPendingCases(pendingCases.filter(c => c.id !== caseId));
      
    } catch (error) {
      console.error("Error rejecting case:", error);
      toast.error("Failed to reject case");
    }
  };

  if (loading) return <Loader />;

  if (!user) {
    // Redirect to login if no user - handled in useEffect
    return <Loader />;
  }

  return (
    <LawyerLayout lawyerId={user.id}>
      <div className="text-sm md:text-md lg:text-md">
        <ToastContainer />
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Lawyer Dashboard</h1>
          <div className="text-end">
            <Formateddate />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-400 text-white rounded-xl shadow p-4">
            <h3 className="font-semibold">Total Cases</h3>
            <p className="text-2xl font-bold mt-2">{stats.totalCases}</p>
          </div>
          <div className="bg-green-400 text-white rounded-xl shadow p-4">
            <h3 className="font-semibold">Active Cases</h3>
            <p className="text-2xl font-bold mt-2">{stats.activeCases}</p>
          </div>
          <div className="bg-purple-400 text-white rounded-xl shadow p-4">
            <h3 className="font-semibold">Completed</h3>
            <p className="text-2xl font-bold mt-2">{stats.completedCases}</p>
          </div>
          <div className="bg-yellow-400 text-white rounded-xl shadow p-4">
            <h3 className="font-semibold">Upcoming Appointments</h3>
            <p className="text-2xl font-bold mt-2">{stats.upcomingAppointments}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="border-b pb-2 last:border-0 flex justify-between">
                    <div>
                      <p className="font-medium">{appointment.client.name}</p>
                      <p className="text-sm text-gray-600">{appointment.client.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDate(appointment.start)}</p>
                      <p className="text-sm text-gray-600">{formatTime(appointment.start)} - {formatTime(appointment.end)}</p>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => router.push('/lawyerAppointments')}
                  className="w-full mt-2 bg-blue-100 text-blue-600 rounded-md py-2 font-medium hover:bg-blue-200 transition"
                >
                  View All Appointments
                </button>
              </div>
            ) : (
              <p className="text-gray-500">No upcoming appointments</p>
            )}
          </div>

          {/* Pending Cases */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Pending Cases</h2>
            {pendingCases.length > 0 ? (
              <div className="space-y-3">
                {pendingCases.map(pendingCase => (
                  <div key={pendingCase.id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between">
                      <p className="font-medium">{pendingCase.title}</p>
                      <p className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</p>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-600">Client: {pendingCase.client.name}</p>
                      <p className="text-sm text-gray-600">Submitted: {formatDate(pendingCase.submittedAt)}</p>
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <button 
                        onClick={() => handleRejectCase(pendingCase.id)}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleApproveCase(pendingCase.id)}
                        className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm hover:bg-green-200 transition"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => router.push('/pendingCases')}
                  className="w-full mt-2 bg-blue-100 text-blue-600 rounded-md py-2 font-medium hover:bg-blue-200 transition"
                >
                  View All Pending Cases
                </button>
              </div>
            ) : (
              <p className="text-gray-500">No pending cases</p>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/manageAvailability')}
              className="bg-blue-400 text-white p-3 rounded-xl font-semibold shadow hover:bg-blue-500 transition"
            >
              Update Availability
            </button>
            <button 
              onClick={() => router.push('/pendingCases')}
              className="bg-blue-400 text-white p-3 rounded-xl font-semibold shadow hover:bg-blue-500 transition"
            >
              Review Pending Cases
            </button>
            <button 
              onClick={() => router.push('/lawyerAppointments')}
              className="bg-blue-400 text-white p-3 rounded-xl font-semibold shadow hover:bg-blue-500 transition"
            >
              Manage Appointments
            </button>
            <button 
              onClick={() => router.push('/lawyerProfile')}
              className="bg-blue-400 text-white p-3 rounded-xl font-semibold shadow hover:bg-blue-500 transition"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </LawyerLayout>
  );
};

export default LawyerDashboard;
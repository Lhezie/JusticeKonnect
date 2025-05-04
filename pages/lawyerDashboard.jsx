// pages/lawyerDashboard.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAuthProvider from "../store/authProvider";
import { Formateddate } from "../utils/date";
import { LawyerLayout } from "../components/LawyerLayout"; // Fixed import with correct casing
import { useRouter } from "next/navigation";
import Loader from "../components/loader";

const LawyerDashboard = () => {
  const { user } = UseAuthProvider();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError(null);
        
        // Use the dashboard-data endpoint
        const response = await fetch('/api/lawyer/dashboard-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        // Handle different types of responses
        if (response.status === 404) {
          // The API is missing - using fallback data
          setStats({
            totalCases: 15,
            activeCases: 8,
            completedCases: 7,
            upcomingAppointments: 3
          });
            
          // Mock data for development
          setUpcomingAppointments([
            { 
              id: 1, 
              client: { name: "John Doe", email: "john@example.com" },
              start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
            },
            { 
              id: 2, 
              client: { name: "Jane Smith", email: "jane@example.com" },
              start: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              end: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString()
            }
          ]);
            
          setPendingCases([
            {
              id: 101,
              title: "Property Dispute",
              description: "Dispute over property boundaries",
              issueType: "Property",
              client: {
                name: "Alex Williams",
                email: "alex@example.com",
                phone: "555-1234"
              },
              submittedAt: new Date().toISOString()
            },
            {
              id: 102,
              title: "Contract Breach",
              description: "Client claims breach of contract",
              issueType: "Contract",
              client: {
                name: "Sarah Miller",
                email: "sarah@example.com",
                phone: "555-5678"
              },
              submittedAt: new Date().toISOString()
            }
          ]);
            
          setLoading(false);
          return;
        } else if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        
        // Update state with API data
        if (data.success) {
          setStats({
            totalCases: data.totalCases || 0,
            activeCases: data.activeCases || 0,
            completedCases: data.completedCases || 0,
            upcomingAppointments: (data.upcomingAppointments || []).length
          });
          
          setUpcomingAppointments(data.upcomingAppointments || []);
          setPendingCases(data.pendingCases || []);
        } else {
          throw new Error(data.message || "Failed to fetch dashboard data");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message || "Failed to load dashboard data");
        toast.error(error.message || "Failed to load dashboard data");
        
        // Set default values for testing
        setStats({
          totalCases: 0,
          activeCases: 0,
          completedCases: 0,
          upcomingAppointments: 0
        });
        
        setUpcomingAppointments([]);
        setPendingCases([]);
        
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
    if (!caseId) return;
    
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success("Case approved successfully");
        
        // Remove the approved case from pending cases
        setPendingCases(pendingCases.filter(c => c.id !== caseId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          activeCases: prev.activeCases + 1
        }));
      } else {
        throw new Error(data.message || "Failed to approve case");
      }
    } catch (error) {
      console.error("Error approving case:", error);
      toast.error(error.message || "Failed to approve case");
    }
  };

  const handleRejectCase = async (caseId) => {
    if (!caseId) return;
    
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success("Case rejected");
        
        // Remove the rejected case from pending cases
        setPendingCases(pendingCases.filter(c => c.id !== caseId));
      } else {
        throw new Error(data.message || "Failed to reject case");
      }
    } catch (error) {
      console.error("Error rejecting case:", error);
      toast.error(error.message || "Failed to reject case");
    }
  };

  // Show loader while fetching data
  if (loading) return <Loader />;

  // Redirect to login if no user - handled in useEffect
  if (!user) return <Loader />;

  // Show error state
  if (error) {
    return (
      <LawyerLayout lawyerId={user?.id}>
        <div className="p-6 text-center">
          <ToastContainer />
          <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout lawyerId={user?.id}>
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
                      <p className="font-medium">{formatDate(appointment.start || appointment.date || new Date())}</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(appointment.start || appointment.date || new Date())} 
                        {appointment.end && ` - ${formatTime(appointment.end)}`}
                      </p>
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
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
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
                      <p className="text-sm text-gray-600">
                        Submitted: {formatDate(pendingCase.submittedAt || pendingCase.createdAt || new Date())}
                      </p>
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
              <p className="text-gray-500 text-center py-4">No pending cases</p>
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
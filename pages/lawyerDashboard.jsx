// pages/lawyerDashboard.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAuthProvider from "../store/authProvider";
import { Formateddate } from "../utils/date";
import { LawyerLayout } from "../components/lawyerlayout";
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
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [pendingCases, setPendingCases] = useState([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Simulate API calls to fetch data
    setTimeout(() => {
      // This would be real API calls in production
      setStats({
        totalCases: 15,
        activeCases: 8,
        completedCases: 7,
        upcomingAppointments: 3
      });

      // Mock upcoming appointments
      setRecentAppointments([
        { 
          id: 1, 
          clientName: "John Doe", 
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          time: "10:00 AM",
          type: "Initial Consultation"
        },
        { 
          id: 2, 
          clientName: "Jane Smith", 
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          time: "2:30 PM",
          type: "Case Review"
        },
        { 
          id: 3, 
          clientName: "Bob Johnson", 
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          time: "9:00 AM",
          type: "Document Signing"
        }
      ]);

      // Mock pending cases awaiting lawyer assignment
      setPendingCases([
        {
          id: 101,
          title: "Property Dispute",
          client: "Alex Williams",
          submittedDate: "2025-04-30",
          status: "pending"
        },
        {
          id: 102,
          title: "Contract Breach",
          client: "Sarah Miller",
          submittedDate: "2025-05-01",
          status: "pending"
        },
        {
          id: 103,
          title: "Child Custody",
          client: "Michael Brown",
          submittedDate: "2025-05-02",
          status: "pending"
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) return <Loader />;

  if (!user) {
    // Redirect to login if no user
    router.push("/lawyerLoginPage");
    return <Loader />;
  }

  return (
    <LawyerLayout lawyerId={user.id}>
      <div className="text-sm md:text-md lg:text-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Lawyer Dashboard</h1>
          <div className="text-end">
            <Formateddate />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mt-6">
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
            {recentAppointments.length > 0 ? (
              <div className="space-y-3">
                {recentAppointments.map(appointment => (
                  <div key={appointment.id} className="border-b pb-2 last:border-0 flex justify-between">
                    <div>
                      <p className="font-medium">{appointment.clientName}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDate(appointment.date)}</p>
                      <p className="text-sm text-gray-600">{appointment.time}</p>
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
                      <p className="text-sm text-gray-600">Client: {pendingCase.client}</p>
                      <p className="text-sm text-gray-600">Submitted: {pendingCase.submittedDate}</p>
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
              Accept New Case
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
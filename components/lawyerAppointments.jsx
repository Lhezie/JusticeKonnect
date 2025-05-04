// components/lawyerAppointments.jsx
import React, { useEffect, useState } from "react";
import { LawyerLayout } from "./lawyerLayout";
import UseAuthProvider from "../store/authProvider";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LawyerAppointments() {
  const { user } = UseAuthProvider();
  const [appointments, setAppointments] = useState({
    upcoming: [],
    past: [],
    today: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) {
      return;
    }

    async function fetchAppointments() {
      try {
        setLoading(true);
        
        // Fetch appointments from API
        const response = await fetch('/api/lawyer/appointments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Include cookies for auth
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const allAppointments = data.appointments || [];
        
        // Sort appointments into categories
        const now = dayjs();
        const today = now.startOf('day');
        const tomorrow = today.add(1, 'day');
        
        const categorized = {
          upcoming: [],
          past: [],
          today: []
        };

        allAppointments.forEach(appointment => {
          const appointmentDate = dayjs(appointment.start);
          
          if (appointmentDate.isBefore(today)) {
            categorized.past.push(appointment);
          } else if (appointmentDate.isBefore(tomorrow)) {
            categorized.today.push(appointment);
          } else {
            categorized.upcoming.push(appointment);
          }
        });
        
        // Sort appointments by date
        categorized.upcoming.sort((a, b) => new Date(a.start) - new Date(b.start));
        categorized.past.sort((a, b) => new Date(b.start) - new Date(a.start)); // Past in reverse order
        categorized.today.sort((a, b) => new Date(a.start) - new Date(b.start));
        
        setAppointments(categorized);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [user]);

  // Format date for display
  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM D, YYYY');
  };

  // Format time for display
  const formatTime = (dateString) => {
    return dayjs(dateString).format('h:mm A');
  };

  // Render an appointment card
  const renderAppointmentCard = (appointment, isPast = false) => {
    return (
      <div key={appointment.id} className={`bg-white rounded-lg shadow p-4 ${isPast ? 'opacity-75' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{appointment.client.name}</h3>
            <p className="text-sm text-gray-600">{formatDate(appointment.start)}</p>
            <p className="text-sm text-gray-600">
              {formatTime(appointment.start)} - {formatTime(appointment.end)}
            </p>
            {appointment.caseTitle && (
              <p className="text-sm mt-1">Case: {appointment.caseTitle}</p>
            )}
          </div>
          
          <div className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </div>
        </div>
        
        <div className="mt-3 flex space-x-2">
          {!isPast && (
            <>
              <button 
                onClick={() => window.open(`mailto:${appointment.client.email}`)}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                Email Client
              </button>
              
              <button 
                onClick={() => window.open(`tel:${appointment.client.phone}`)}
                className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
              >
                Call Client
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Get color for status badge
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <LawyerLayout>
      <div className="p-6">
        <ToastContainer />
        <h1 className="text-xl font-bold mb-6">Manage Appointments</h1>

        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Today's Appointments */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Today's Appointments</h2>
              {appointments.today.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {appointments.today.map(appointment => renderAppointmentCard(appointment))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                  No appointments scheduled for today.
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Upcoming Appointments</h2>
              {appointments.upcoming.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {appointments.upcoming.map(appointment => renderAppointmentCard(appointment))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                  No upcoming appointments.
                </div>
              )}
            </div>

            {/* Past Appointments */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Past Appointments</h2>
              {appointments.past.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {appointments.past.map(appointment => renderAppointmentCard(appointment, true))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                  No past appointments.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </LawyerLayout>
  );
}
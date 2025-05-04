// pages/appointment.jsx
import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ClientLayout } from "../components/clientLayout";
import dayjs from "dayjs";
import UseAuthProvider from "../store/authProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/loader";

export default function AppointmentPage() {
  const calendarRef = useRef(null);
  const { user } = UseAuthProvider();
  const [assignedLawyer, setAssignedLawyer] = useState(null);
  const [approvedCase, setApprovedCase] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [busySlots, setBusySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDates, setViewDates] = useState({
    start: dayjs().startOf("week").toISOString(),
    end: dayjs().endOf("week").toISOString(),
  });
  const [canBookAppointment, setCanBookAppointment] = useState(false);
  const [noCases, setNoCases] = useState(false);

  // Check if client has approved cases
  useEffect(() => {
    if (!user) return;

    async function checkApprovedCase() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/client/case-lawyer', {
          credentials: 'include'
        });
        
        if (response.status === 404) {
          setCanBookAppointment(false);
          setNoCases(true);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.case && data.lawyer) {
          setApprovedCase(data.case);
          setAssignedLawyer({
            id: data.lawyer.id,
            userId: data.lawyer.id, // This should be the user ID associated with the lawyer
            name: data.lawyer.name,
            email: data.lawyer.email
          });
          setCanBookAppointment(true);
        } else {
          setCanBookAppointment(false);
          setNoCases(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking approved cases:", error);
        toast.error("Failed to check your cases");
        setLoading(false);
      }
    }
    
    checkApprovedCase();
  }, [user]);

  // Fetch lawyer availability when assigned lawyer is set
  useEffect(() => {
    if (!assignedLawyer || !viewDates) return;
    
    async function fetchAvailability() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/lawyer/available-slots', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lawyerId: assignedLawyer.userId,
            start: viewDates.start,
            end: viewDates.end
          })
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Fetch busy slots
        const busyResponse = await fetch('/api/lawyer/busy-slots', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lawyerId: assignedLawyer.userId,
            start: viewDates.start,
            end: viewDates.end
          })
        });

        if (!busyResponse.ok) {
          throw new Error(`API returned ${busyResponse.status}`);
        }

        const busyData = await busyResponse.json();

        // Update state with available and busy slots
        setAvailableSlots(data.available || []);
        setBusySlots(busyData.busy || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lawyer availability:", error);
        toast.error("Failed to fetch lawyer availability");
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [assignedLawyer, viewDates]);

  // Handle date range change in calendar
  const handleDateSet = (dateInfo) => {
    setViewDates({
      start: dayjs(dateInfo.start).toISOString(),
      end: dayjs(dateInfo.end).toISOString()
    });
  };

  // Handle slot selection
  const handleSlotSelect = async (selectionInfo) => {
    if (!canBookAppointment) {
      toast.warning("You need an approved case to book an appointment");
      return;
    }

    // Check if selected slot is available (green background)
    const isAvailable = isTimeSlotAvailable(selectionInfo.start, selectionInfo.end);

    if (!isAvailable) {
      toast.warning("Selected time slot is not available");
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `Book appointment with ${assignedLawyer.name} on ${dayjs(selectionInfo.start).format('MMMM D, YYYY')} from ${dayjs(selectionInfo.start).format('h:mm A')} to ${dayjs(selectionInfo.end).format('h:mm A')}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lawyerId: assignedLawyer.userId,
          caseId: approvedCase.id,
          start: selectionInfo.start.toISOString(),
          end: selectionInfo.end.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();
      toast.success("Appointment booked successfully!");

      // Refresh availability after booking
      setViewDates({
        start: dayjs().startOf("week").toISOString(),
        end: dayjs().endOf("week").toISOString()
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(error.message || "Failed to book appointment");
    }
  };

  // Helper function to check if time slot is within available slots
  const isTimeSlotAvailable = (start, end) => {
    const startTime = dayjs(start);
    const endTime = dayjs(end);
    
    // Check if slot falls within any available slot
    return availableSlots.some(slot => {
      if (slot.daysOfWeek) {
        // Recurring slot
        const day = startTime.day(); // 0-6, 0 is Sunday
        const isCorrectDay = slot.daysOfWeek.includes(day);
        
        if (!isCorrectDay) return false;
        
        const slotStart = slot.startTime || '09:00'; // Default start time
        const slotEnd = slot.endTime || '17:00'; // Default end time
        
        const [startHour, startMinute] = slotStart.split(':').map(Number);
        const [endHour, endMinute] = slotEnd.split(':').map(Number);
        
        const availStart = startTime.hour(startHour).minute(startMinute);
        const availEnd = startTime.hour(endHour).minute(endMinute);
        
        return startTime.isAfter(availStart) && endTime.isBefore(availEnd);
      } else {
        // One-time slot
        const slotStart = dayjs(slot.start);
        const slotEnd = dayjs(slot.end);
        
        return startTime.isAfter(slotStart) && endTime.isBefore(slotEnd);
      }
    });
  };

  // Render loading state
  if (loading) {
    return <Loader />;
  }

  // Render no cases state
  if (noCases) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Approved Cases</h2>
          <p className="text-gray-600 mb-6">
            You do not have any approved cases to book an appointment. Please submit a case first and wait for lawyer approval.
          </p>
          <button
            onClick={() => window.location.href = '/createNewCase'}
            className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500"
          >
            Submit a New Case
          </button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Book Appointment with {assignedLawyer?.name}
        </h1>
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Case Details</h2>
          <p><span className="font-medium">Title:</span> {approvedCase?.title}</p>
          <p><span className="font-medium">Type:</span> {approvedCase?.issueType}</p>
          <p><span className="font-medium">Status:</span> {approvedCase?.status}</p>
          <p className="text-sm text-gray-500 mt-2">
            Please select an available time slot (green areas) to book your appointment.
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={[...availableSlots, ...busySlots]}
            dateClick={() => {}} // Disable single-click selection
            selectable={true}
            select={handleSlotSelect}
            datesSet={handleDateSet}
            selectOverlap={false}
            slotMinTime="09:00:00"
            slotMaxTime="17:00:00"
            allDaySlot={false}
            height="auto"
            eventColor="#3788d8"
            eventContent={(eventInfo) => {
              // For busy slots, show info about appointment
              if (eventInfo.event.backgroundColor === '#ff9f89' || eventInfo.event.backgroundColor === '#ff6b6b') {
                return (
                  <div className="p-1">
                    <p className="text-xs">Busy</p>
                  </div>
                );
              }
              
              // For available slots, show "Available"
              return (
                <div className="p-1">
                  <p className="text-xs">Available</p>
                </div>
              );
            }}
          />
        </div>
        <ToastContainer />
      </div>
    </ClientLayout>
  );
}
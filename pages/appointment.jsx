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

    async function checkApprovedCases() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/client/approved-cases', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.cases && data.cases.length > 0) {
          setCanBookAppointment(true);
          
          // Set assigned lawyer for appointment
          const approvedCase = data.cases[0]; // Get first approved case
          setAssignedLawyer({
            id: approvedCase.lawyer.id,
            userId: approvedCase.lawyer.userId,
            name: approvedCase.lawyer.user.fullName,
            email: approvedCase.lawyer.user.email
          });
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
    
    checkApprovedCases();
  }, [user]);

  // Fetch lawyer availability when assigned lawyer is set
  useEffect(() => {
    if (!assignedLawyer || !viewDates) return;
    
    async function fetchAvailability() {
      try {
        setLoading(true);
        // Continued from previous code...
        const response = await fetch('/api/lawyer/availability', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lawyerId: assignedLawyer.userId,
            startDate: viewDates.start,
            endDate: viewDates.end
          })
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Separate available and busy slots
        const available = data.availableSlots.map(slot => ({
          start: slot.start,
          end: slot.end,
          display: 'background',
          className: 'available-slot'
        }));

        const busy = data.busySlots.map(slot => ({
          start: slot.start,
          end: slot.end,
          display: 'background',
          className: 'busy-slot'
        }));

        setAvailableSlots(available);
        setBusySlots(busy);
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
    // Check if selected slot is available
    const isAvailable = availableSlots.some(slot => 
      dayjs(slot.start).isSame(selectionInfo.start) && 
      dayjs(slot.end).isSame(selectionInfo.end)
    );

    if (!isAvailable) {
      toast.error("Selected slot is not available");
      return;
    }

    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lawyerId: assignedLawyer.userId,
          start: selectionInfo.start.toISOString(),
          end: selectionInfo.end.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      toast.success("Appointment booked successfully!");

      // Refresh availability after booking
      const currentViewDates = {
        start: dayjs().startOf("week").toISOString(),
        end: dayjs().endOf("week").toISOString()
      };
      setViewDates(currentViewDates);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment");
    }
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
          <h2 className="text-2xl font-bold mb-4">No Active Cases</h2>
          <p className="text-gray-600">
            You do not have any approved cases to book an appointment.
          </p>
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
          dateClick={handleSlotSelect}
          datesSet={handleDateSet}
          selectable={true}
          selectConstraint="available-slot"
          selectOverlap={false}
          slotMinTime="09:00:00"
          slotMaxTime="17:00:00"
          allDaySlot={false}
          height="auto"
          eventColor="#3788d8"
        />
        <ToastContainer />
      </div>
    </ClientLayout>
  );
}
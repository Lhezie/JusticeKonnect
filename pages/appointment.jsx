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
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Check if client has approved cases and retrieve assigned lawyer
  useEffect(() => {
    if (!user) {
      return;
    }

    async function checkApprovedCases() {
      try {
        setLoading(true);
        
        // Fetch case and lawyer info
        const response = await fetch('/api/client/case-lawyer', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.case && data.lawyer) {
          // Only allow booking if the case is approved
          setCanBookAppointment(data.case.status === 'APPROVED');
          
          // Set assigned lawyer for appointment
          setAssignedLawyer({
            id: data.lawyer.id,
            userId: data.lawyer.id,
            name: data.lawyer.name,
            email: data.lawyer.email,
            specialty: data.lawyer.specialty
          });
        } else {
          setCanBookAppointment(false);
          setNoCases(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking approved cases:", error);
        toast.error("Failed to check your cases");
        setCanBookAppointment(false);
        setNoCases(true);
        setLoading(false);
      }
    }
    
    checkApprovedCases();
  }, [user]);

  // Fetch lawyer availability when assigned lawyer is set and view dates change
  useEffect(() => {
    if (!assignedLawyer || !viewDates || !canBookAppointment) {
      return;
    }
    
    async function fetchAvailability() {
      try {
        setLoading(true);
        
        // Fetch lawyer's availability slots
        const availResponse = await fetch('/api/lawyer/available-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lawyerId: assignedLawyer.userId,
            start: viewDates.start,
            end: viewDates.end
          }),
          credentials: 'include'
        });

        if (!availResponse.ok) {
          throw new Error(`Failed to fetch availability: ${availResponse.status}`);
        }

        const availData = await availResponse.json();
        setAvailableSlots(availData.available || []);
        
        // Fetch lawyer's busy slots (existing appointments)
        const busyResponse = await fetch('/api/lawyer/busy-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lawyerId: assignedLawyer.userId,
            start: viewDates.start,
            end: viewDates.end
          }),
          credentials: 'include'
        });

        if (!busyResponse.ok) {
          throw new Error(`Failed to fetch busy slots: ${busyResponse.status}`);
        }

        const busyData = await busyResponse.json();
        setBusySlots(busyData.busy || []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Failed to fetch lawyer's availability");
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [assignedLawyer, viewDates, canBookAppointment]);

  // Handle date range change in calendar
  const handleDateSet = (dateInfo) => {
    setViewDates({
      start: dayjs(dateInfo.start).toISOString(),
      end: dayjs(dateInfo.end).toISOString()
    });
  };

  // Check if a slot is available (within an available slot and not overlapping a busy slot)
  const isSlotAvailable = (start, end) => {
    // Check if it's within any available slot
    const withinAvailable = availableSlots.some(slot => {
      if (slot.daysOfWeek) {
        // For recurring availability
        const day = dayjs(start).day();
        return slot.daysOfWeek.includes(day) &&
          dayjs(start).format('HH:mm') >= slot.startTime &&
          dayjs(end).format('HH:mm') <= slot.endTime;
      } else {
        // For specific date availability
        return dayjs(start).isAfter(dayjs(slot.start)) &&
          dayjs(end).isBefore(dayjs(slot.end));
      }
    });

    // Check if it overlaps with any busy slot
    const overlapsWithBusy = busySlots.some(slot => {
      return !(dayjs(end).isSameOrBefore(dayjs(slot.start)) ||
        dayjs(start).isSameOrAfter(dayjs(slot.end)));
    });

    return withinAvailable && !overlapsWithBusy;
  };

  // Handle slot selection
  const handleSlotSelect = (selectionInfo) => {
    if (!canBookAppointment) {
      toast.error("You don't have any approved cases to book an appointment");
      return;
    }

    const isAvailable = isSlotAvailable(selectionInfo.start, selectionInfo.end);

    if (!isAvailable) {
      toast.error("Selected slot is not available");
      return;
    }

    // Store the selected slot for confirmation
    setSelectedSlot({
      start: selectionInfo.startStr,
      end: selectionInfo.endStr
    });
  };

  // Handle appointment booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
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
          start: selectedSlot.start,
          end: selectedSlot.end
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to book appointment: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success("Appointment booked successfully!");
        setSelectedSlot(null);
        
        // Refresh availability
        setViewDates({
          start: dayjs().startOf("week").toISOString(),
          end: dayjs().endOf("week").toISOString(),
        });
      } else {
        toast.error(data.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  // Cancel booking flow
  const handleCancelBooking = () => {
    setSelectedSlot(null);
  };

  // Render loading state
  if (loading) {
    return <Loader />;
  }

  // Render no cases state
  if (noCases || !canBookAppointment) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Approved Cases</h2>
          <p className="text-gray-600 mb-6">
            You need an approved case to book an appointment with a lawyer.
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
        <ToastContainer />
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Book Appointment with {assignedLawyer?.name}
          </h1>
          <p className="text-gray-600">
            Select an available time slot on the calendar below.
          </p>
          {assignedLawyer?.specialty && (
            <p className="text-sm text-gray-500">Specialty: {assignedLawyer.specialty}</p>
          )}
        </div>
        
        {/* Booking confirmation modal */}
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h2 className="text-xl font-bold mb-4">Confirm Appointment</h2>
              <p className="mb-2">
                <span className="font-medium">Date:</span> {dayjs(selectedSlot.start).format('dddd, MMMM D, YYYY')}
              </p>
              <p className="mb-4">
                <span className="font-medium">Time:</span> {dayjs(selectedSlot.start).format('h:mm A')} - {dayjs(selectedSlot.end).format('h:mm A')}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-4">
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
            selectable={true}
            select={handleSlotSelect}
            datesSet={handleDateSet}
            selectConstraint="available"
            selectOverlap={false}
            slotMinTime="09:00:00"
            slotMaxTime="17:00:00"
            allDaySlot={false}
            height="auto"
            selectMirror={true}
            eventContent={(eventInfo) => {
              // For available slots
              if (eventInfo.event.display === 'background' && eventInfo.event.backgroundColor === '#a0e4b0') {
                return (
                  <div className="text-xs text-green-800 p-1">
                    Available
                  </div>
                );
              }
              
              // For busy slots (appointments)
              if (eventInfo.event.backgroundColor === '#ff9f89') {
                return (
                  <div className="text-xs text-red-800 p-1">
                    Unavailable
                  </div>
                );
              }
              
              return null;
            }}
          />
          
          <div className="mt-4 flex space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 mr-2"></div>
              <span className="text-sm">Available Time</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 mr-2"></div>
              <span className="text-sm">Unavailable Time</span>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
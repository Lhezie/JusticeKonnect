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

export default function AppointmentPage() {
  const calendarRef = useRef(null);
  const { user } = UseAuthProvider();
  const [lawyerEmail, setLawyerEmail] = useState("default-lawyer@justiceconnect.com"); // Default lawyer
  const [busySlots, setBusySlots] = useState([]); // Initialize with empty array
  const [viewDates, setViewDates] = useState({
    start: dayjs().startOf("week").toISOString(),
    end: dayjs().endOf("week").toISOString(),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    async function fetchBusyTimes() {
      setLoading(true);
      try {
        // For development, we'll use mock data since /api/freebusy is returning 404
        // In production, uncomment and use the API call below
        /*
        const response = await fetch('/api/freebusy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: lawyerEmail,
            start: viewDates.start,
            end: viewDates.end,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        setBusySlots(data.busy || []);
        */
        
        // Mock data for development
        const mockBusySlots = [
          {
            start: dayjs().add(1, 'day').hour(10).minute(0).second(0).toISOString(),
            end: dayjs().add(1, 'day').hour(11).minute(30).second(0).toISOString()
          },
          {
            start: dayjs().add(2, 'day').hour(14).minute(0).second(0).toISOString(),
            end: dayjs().add(2, 'day').hour(15).minute(0).second(0).toISOString()
          }
        ];
        
        setBusySlots(mockBusySlots);
      } catch (error) {
        console.error("Error fetching busy slots:", error);
        toast.error("Failed to load lawyer's schedule");
        setBusySlots([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    }
    
    fetchBusyTimes();
  }, [lawyerEmail, viewDates, user]);

  const busyEvents = busySlots.map((slot) => ({
    start: slot.start,
    end: slot.end,
    display: "background",
    backgroundColor: "#ff9f89",
  }));

  const handleSelect = (info) => {
    if (!user) {
      toast.error("Please log in to book an appointment");
      return;
    }
    
    const { startStr, endStr } = info;
    if (
      window.confirm(
        `Book from ${dayjs(startStr).format("MMM D, HH:mm")} to ${dayjs(
          endStr
        ).format("HH:mm")}?`
      )
    ) {
      // For development, simulate successful booking
      toast.success("Appointment booked successfully!");
      
      // In production, uncomment and use the API call below
      /*
      fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: user.id,
          lawyerEmail,
          start: startStr,
          end: endStr,
        }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          toast.success("Appointment booked successfully!");
          // Refresh busy slots
          fetchBusyTimes();
        })
        .catch(error => {
          console.error("Failed to book slot:", error);
          toast.error("Failed to book appointment. Please try again.");
        });
      */
    }
  };

  const handleDatesSet = (arg) => {
    setViewDates({ start: arg.startStr, end: arg.endStr });
  };

  return (
    <ClientLayout clientId={user?.id} lawyerId={lawyerEmail}>
      <div className="p-6">
        <ToastContainer />
        <h1 className="text-xl font-bold mb-4">Availability Calendar</h1>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Select a time slot to book an appointment with our lawyer.
            Highlighted areas are unavailable.
          </p>
          {loading && <p className="text-sm text-blue-500">Loading lawyer's schedule...</p>}
        </div>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridDay,timeGridWeek,dayGridMonth",
          }}
          selectable
          selectMirror
          slotDuration="00:60:00"
          slotLabelInterval="01:00:00"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          aspectRatio={1.5}
          events={busyEvents}
          select={handleSelect}
          dateClick={() => {}}
          datesSet={handleDatesSet}
          showNonCurrentDates
        />
        <style jsx global>{`
          .fc .fc-daygrid-day-frame {
            aspect-ratio: 1 / 1;
          }
          .fc .fc-daygrid-day-number {
            color: #000;
          }

          .fc .fc-timegrid-slot {
            border-bottom: 5px;
            height: 3.5em;
          }
        `}</style>
      </div>
    </ClientLayout>
  );
}
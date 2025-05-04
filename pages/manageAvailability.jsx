// pages/manageAvailability.jsx
import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { LawyerLayout } from "../components/lawyerlayout";
import UseAuthProvider from "../store/authProvider";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/loader";

export default function ManageAvailability() {
  const calendarRef = useRef(null);
  const { user } = UseAuthProvider();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [busySlots, setBusySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDates, setViewDates] = useState({
    start: dayjs().startOf("week").toISOString(),
    end: dayjs().endOf("week").toISOString(),
  });

  useEffect(() => {
    if (!user) return;

    async function fetchAvailability() {
      setLoading(true);
      try {
        // For development, use mock data
        // In production, this would be actual API calls
        
        // Mock busy slots (existing appointments)
        const mockBusySlots = [
          {
            id: 'busy-1',
            start: dayjs().add(1, 'day').hour(10).minute(0).second(0).toISOString(),
            end: dayjs().add(1, 'day').hour(11).minute(30).second(0).toISOString(),
            title: 'Client Meeting'
          },
          {
            id: 'busy-2',
            start: dayjs().add(2, 'day').hour(14).minute(0).second(0).toISOString(),
            end: dayjs().add(2, 'day').hour(15).minute(0).second(0).toISOString(),
            title: 'Case Review'
          }
        ];
        
        // Mock available slots
        const mockAvailableSlots = [
          {
            id: 'avail-1',
            start: dayjs().hour(9).minute(0).second(0).toISOString(),
            end: dayjs().hour(17).minute(0).second(0).toISOString(),
            daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
            startTime: '09:00',
            endTime: '17:00',
            display: 'background',
            backgroundColor: '#a0e4b0'
          }
        ];
        
        setBusySlots(mockBusySlots);
        setAvailableSlots(mockAvailableSlots);
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Failed to load your schedule");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAvailability();
  }, [user, viewDates]);

  const handleSelect = async (info) => {
    if (!user) {
      toast.error("Please log in to update your availability");
      return;
    }
    
    const { startStr, endStr } = info;
    const start = dayjs(startStr);
    const end = dayjs(endStr);
    
    // Check if the selection is within the same day
    if (start.date() !== end.date()) {
      toast.warning("Please select time slots within the same day");
      return;
    }
    
    const action = window.confirm(
      `Would you like to mark ${dayjs(startStr).format("MMM D, HH:mm")} to ${dayjs(
        endStr
      ).format("HH:mm")} as available for appointments?`
    );
    
    if (action) {
      // In production, this would be an API call
      try {
        /*
        const response = await fetch('/api/lawyer/add-availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lawyerId: user.id,
            start: startStr,
            end: endStr,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        */
        
        // For development, simulate API response
        const newSlot = {
          id: `avail-${Date.now()}`,
          start: startStr,
          end: endStr,
          display: 'background',
          backgroundColor: '#a0e4b0'
        };
        
        setAvailableSlots(prev => [...prev, newSlot]);
        toast.success("Availability updated successfully!");
      } catch (error) {
        console.error("Failed to update availability:", error);
        toast.error("Failed to update availability. Please try again.");
      }
    }
  };

  const handleEventClick = async (info) => {
    const { event } = info;
    
    // Only allow removing available slots, not busy slots
    if (event.backgroundColor !== '#a0e4b0') {
      toast.info("This is a booked appointment and cannot be removed");
      return;
    }
    
    const action = window.confirm(
      `Would you like to remove this available time slot?`
    );
    
    if (action) {
      // In production, this would be an API call
      try {
        /*
        const response = await fetch('/api/lawyer/remove-availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lawyerId: user.id,
            slotId: event.id,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        */
        
        // For development, simulate API response
        setAvailableSlots(prev => prev.filter(slot => slot.id !== event.id));
        toast.success("Availability removed successfully!");
      } catch (error) {
        console.error("Failed to remove availability:", error);
        toast.error("Failed to remove availability. Please try again.");
      }
    }
  };

  const handleDatesSet = (arg) => {
    setViewDates({ start: arg.startStr, end: arg.endStr });
  };

  // Set up recurring availability
  const handleSetRecurring = () => {
    const daysOfWeek = window.prompt('Enter days of week (0=Sunday, 1=Monday, ...6=Saturday) separated by commas:', '1,2,3,4,5');
    if (!daysOfWeek) return;
    
    const startTime = window.prompt('Enter start time (HH:MM)', '09:00');
    if (!startTime) return;
    
    const endTime = window.prompt('Enter end time (HH:MM)', '17:00');
    if (!endTime) return;
    
    try {
      const daysArray = daysOfWeek.split(',').map(d => parseInt(d.trim(), 10));
      
      // Validate inputs
      if (daysArray.some(d => isNaN(d) || d < 0 || d > 6)) {
        throw new Error('Invalid days format');
      }
      
      const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new Error('Invalid time format');
      }
      
      // Create recurring slot
      const newRecurringSlot = {
        id: `recurring-${Date.now()}`,
        daysOfWeek: daysArray,
        startTime,
        endTime,
        display: 'background',
        backgroundColor: '#a0e4b0'
      };
      
      setAvailableSlots(prev => [...prev, newRecurringSlot]);
      toast.success("Recurring availability added successfully!");
    } catch (error) {
      console.error("Invalid input:", error);
      toast.error("Invalid input. Please try again with the correct format.");
    }
  };

  if (!user) {
    return (
      <LawyerLayout>
        <div className="p-6">
          <h1 className="text-xl font-bold mb-4">Please log in to manage your availability</h1>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout lawyerId={user.id}>
      <div className="p-6">
        <ToastContainer />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Manage Your Availability</h1>
          <div className="space-x-2">
            <button 
              onClick={handleSetRecurring}
              className="bg-blue-400 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition"
            >
              Set Recurring Availability
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <p>Loading your schedule...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Instructions:</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Click and drag on the calendar to mark time slots when you're available for appointments</li>
                <li>Click on a green slot to remove availability</li>
                <li>Busy slots (shown in red) are already booked appointments and cannot be changed</li>
                <li>Use the "Set Recurring Availability" button to quickly set up your regular schedule</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
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
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                aspectRatio={1.5}
                events={[...busySlots, ...availableSlots]}
                select={handleSelect}
                eventClick={handleEventClick}
                datesSet={handleDatesSet}
                showNonCurrentDates
                eventContent={(eventInfo) => {
                  // For busy slots, show title
                  if (eventInfo.event.backgroundColor !== '#a0e4b0') {
                    return (
                      <div className="p-1">
                        <p className="text-xs font-bold">{eventInfo.event.title}</p>
                        <p className="text-xs">{eventInfo.timeText}</p>
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
          </>
        )}
      </div>
    </LawyerLayout>
  );
}
import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAppointmentStore } from '../store/appointmentstoreProvider';
import ClientLayout from '../components/clientLayout';
import dayjs from 'dayjs';

export default function AppointmentPage({ lawyerEmail, clientId }) {
  const calendarRef = useRef(null);
  const { busySlots, fetchBusy, bookSlot } = useAppointmentStore();
  const [viewDates, setViewDates] = useState({
    start: dayjs().startOf('week').toISOString(),
    end: dayjs().endOf('week').toISOString(),
  });

  useEffect(() => {
    fetchBusy({ email: lawyerEmail, start: viewDates.start, end: viewDates.end });
  }, [lawyerEmail, viewDates]);

  const busyEvents = busySlots.map(slot => ({
    start: slot.start,
    end: slot.end,
    display: 'background',
  }));

  const handleSelect = info => {
    const { startStr, endStr } = info;
    if (window.confirm(
      `Book from ${dayjs(startStr).format('MMM D, HH:mm')} to ${dayjs(endStr).format('HH:mm')}?`
    )) {
      bookSlot({ clientId, lawyerEmail, start: startStr, end: endStr });
    }
  };

  const handleDatesSet = (arg) => {
    setViewDates({
      start: arg.startStr,
      end: arg.endStr
    });
  };

  return (
    <ClientLayout>
      
      <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Availability Calendar</h1>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth'
        }}
        selectable={true}
        selectMirror={true}
        slotDuration="00:15:00"
        slotLabelInterval="01:00:00"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        aspectRatio={1.5}
        events={busyEvents}
        select={handleSelect}
        dateClick={() => {}}
        datesSet={handleDatesSet}
        showNonCurrentDates={true}
      />
      <style jsx global>{`
        .fc .fc-daygrid-day-frame {
          /* Make month/week cells square in dayGrid views */
          aspect-ratio: 1 / 1;
        }
      `}</style>
    </div>
   </ClientLayout>
  );
}

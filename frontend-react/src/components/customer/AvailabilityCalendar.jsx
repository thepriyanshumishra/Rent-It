import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const AvailabilityCalendar = ({ productId, productName = '', unavailableDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDateSet, setBookedDateSet] = useState(new Set());
  const [bookedRangeStr, setBookedRangeStr] = useState('');

  useEffect(() => {
    const datesSet = new Set(unavailableDates);
    let startStr = '';
    let endStr = '';

    try {
      const stored = localStorage.getItem('rentos_placed_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        
        orders.forEach(o => {
          const oName = o.product?.name || o.items?.[0]?.product?.name || '';
          const matchId = productId && (o.product_id === productId || o.product?.id === productId);
          const matchName = productName && oName && (
            oName.toLowerCase().includes(productName.toLowerCase()) || 
            productName.toLowerCase().includes(oName.toLowerCase())
          );

          if ((matchId || matchName) && o.start_date && o.end_date) {
            startStr = o.start_date;
            endStr = o.end_date;

            let cur = new Date(o.start_date);
            const end = new Date(o.end_date);

            while (cur <= end) {
              const yyyy = cur.getFullYear();
              const mm = String(cur.getMonth() + 1).padStart(2, '0');
              const dd = String(cur.getDate()).padStart(2, '0');
              datesSet.add(`${yyyy}-${mm}-${dd}`);
              cur.setDate(cur.getDate() + 1);
            }
          }
        });
      }
    } catch (e) {
      console.warn('Calendar booked dates read warning', e);
    }

    setBookedDateSet(datesSet);
    if (startStr && endStr && datesSet.size > 0) {
      setBookedRangeStr(`${startStr} → ${endStr}`);
    } else {
      setBookedRangeStr('');
    }
  }, [productId, productName, unavailableDates]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-1.5"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isUnavailable = bookedDateSet.has(dateStr);
      
      days.push(
        <div 
          key={i} 
          className={`
            p-2 flex items-center justify-center text-xs font-bold rounded-xl transition-all relative
            ${isUnavailable 
              ? 'bg-danger/15 text-danger border border-danger/40 shadow-xs' 
              : 'text-text hover:bg-bg-subtle cursor-default font-semibold'}
          `}
          title={isUnavailable ? 'Booked / Out on Rental' : 'Available for rental'}
        >
          {i}
          {isUnavailable && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-danger"></span>
          )}
        </div>
      );
    }
    
    return days;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-bg-elevated border border-border rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-extrabold text-base text-text">Availability Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-xl hover:bg-bg-subtle text-text-muted hover:text-text transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-xs text-text min-w-[100px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-xl hover:bg-bg-subtle text-text-muted hover:text-text transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[11px] font-bold text-text-muted">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderMonth(currentDate)}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2 text-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success/20 border border-success"></div>
            <span className="text-text-muted font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger/20 border border-danger"></div>
            <span className="text-danger font-bold">Booked / Unavailable</span>
          </div>
        </div>

        {bookedRangeStr && (
          <div className="mt-1 p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[11px] font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Booked Slot: {bookedRangeStr}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;

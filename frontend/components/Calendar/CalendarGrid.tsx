'use client';

import { Entry } from '@/types';
import { DayCell } from './DayCell';

interface CalendarGridProps {
  year: number;
  month: number;
  entries: Entry[];
  onDateClick: (date: Date) => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const days: Date[] = [];

  // Add days from previous month
  const startDayOfWeek = firstDay.getDay();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, -i);
    days.push(date);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month - 1, i));
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CalendarGrid({ year, month, entries, onDateClick }: CalendarGridProps) {
  const days = getCalendarDays(year, month);
  const today = new Date();

  const entryMap = new Map(entries.map((e) => [e.date, e]));

  return (
    <div className="border-t border-l border-gray-200">
      {/* Weekday headers */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`
              py-2 text-center text-sm font-medium border-b border-r border-gray-200
              ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dateStr = formatDate(date);
          const isCurrentMonth = date.getMonth() + 1 === month;
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          return (
            <DayCell
              key={index}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              entry={entryMap.get(dateStr)}
              onClick={onDateClick}
            />
          );
        })}
      </div>
    </div>
  );
}

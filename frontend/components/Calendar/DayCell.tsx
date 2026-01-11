'use client';

import { Entry } from '@/types';
import { Avatar } from '@/components/common/Avatar';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  entry?: Entry;
  onClick: (date: Date) => void;
}

export function DayCell({ date, isCurrentMonth, isToday, entry, onClick }: DayCellProps) {
  const dayNumber = date.getDate();

  return (
    <div
      onClick={() => onClick(date)}
      className={`
        min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-gray-200
        cursor-pointer hover:bg-gray-50 transition-colors
        ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
      `}
    >
      <div className="flex flex-col items-center sm:items-start gap-1">
        <span
          className={`
            text-sm font-medium w-7 h-7 flex items-center justify-center
            ${isToday ? 'bg-blue-600 text-white rounded-full' : ''}
            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
          `}
        >
          {dayNumber}
        </span>
        {entry && (
          <div className="flex flex-col items-center sm:items-start gap-1 mt-1">
            <Avatar src={entry.photo_url} alt={entry.name} size="sm" />
            <span className="hidden sm:block text-xs text-gray-600 truncate max-w-full">
              {entry.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

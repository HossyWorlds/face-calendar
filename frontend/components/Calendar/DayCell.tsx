'use client';

import { Entry } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { resolveBackendUrl } from '@/lib/api';

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
        min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-gray-200
        cursor-pointer hover:bg-gray-50 transition-colors
        ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
      `}
    >
      <span
        className={`
          text-xs font-medium w-6 h-6 flex items-center justify-center mb-1
          ${isToday ? 'bg-blue-600 text-white rounded-full' : ''}
          ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
        `}
      >
        {dayNumber}
      </span>
      {entry && (
        <div className="flex flex-col items-center gap-1">
          <Avatar src={resolveBackendUrl(entry.photo_url)} alt={entry.name} size="md" />
          <span className="text-xs text-gray-700 truncate max-w-full text-center font-medium">
            {entry.name}
          </span>
        </div>
      )}
    </div>
  );
}

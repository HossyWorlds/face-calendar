'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ];

  return (
    <div className="flex items-center justify-between py-4 px-2 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="outline" size="sm" onClick={onToday}>
          今日
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <h1 className="text-lg sm:text-xl font-semibold">
        {year}年{monthNames[month - 1]}
      </h1>
      <div className="w-[100px] sm:w-[140px]" /> {/* Spacer for centering */}
    </div>
  );
}

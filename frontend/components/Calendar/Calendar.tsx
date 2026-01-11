'use client';

import { useState, useCallback } from 'react';
import { Entry, EntryFormData } from '@/types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EntryModal } from '@/components/Modal/EntryModal';
import { mockEntries, getEntryByDate } from '@/lib/mock-data';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [entries, setEntries] = useState<Entry[]>(mockEntries);

  const handlePrevMonth = useCallback(() => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const handleToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }, [today]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleSave = useCallback((data: EntryFormData) => {
    if (!selectedDate) return;

    const dateStr = formatDate(selectedDate);
    const existingEntry = entries.find((e) => e.date === dateStr);

    if (existingEntry) {
      // Update existing entry
      setEntries((prev) =>
        prev.map((e) =>
          e.id === existingEntry.id
            ? {
                ...e,
                name: data.name,
                location: data.location || undefined,
                time_of_day: data.time_of_day,
                memo: data.memo || undefined,
                photo_url: data.photo_url || e.photo_url,
              }
            : e
        )
      );
    } else {
      // Create new entry
      const newEntry: Entry = {
        id: crypto.randomUUID(),
        date: dateStr,
        photo_url: data.photo_url || 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70),
        name: data.name,
        location: data.location || undefined,
        time_of_day: data.time_of_day,
        memo: data.memo || undefined,
      };
      setEntries((prev) => [...prev, newEntry]);
    }

    setSelectedDate(null);
  }, [selectedDate, entries]);

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedDate(null);
  }, []);

  // Filter entries for current month view
  const monthEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month;
  });

  const selectedEntry = selectedDate
    ? entries.find((e) => e.date === formatDate(selectedDate))
    : undefined;

  return (
    <div className="max-w-6xl mx-auto">
      <CalendarHeader
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
      <CalendarGrid
        year={year}
        month={month}
        entries={monthEntries}
        onDateClick={handleDateClick}
      />
      <EntryModal
        isOpen={selectedDate !== null}
        date={selectedDate}
        entry={selectedEntry}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Entry, EntryFormData } from '@/types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EntryModal } from '@/components/Modal/EntryModal';
import { api } from '@/lib/api';

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
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entries when month/year changes
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getEntries(year, month);
        // Map backend data to frontend format (person_name -> name)
        const mappedData = data.map((entry) => ({
          ...entry,
          name: entry.person_name || entry.name,
        }));
        setEntries(mappedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entries');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [year, month]);

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

  const handleSave = useCallback(
    async (data: EntryFormData) => {
      if (!selectedDate) return;

      try {
        const dateStr = formatDate(selectedDate);
        const existingEntry = entries.find((e) => e.date === dateStr);

        if (existingEntry) {
          // Update existing entry
          const updated = await api.updateEntry(existingEntry.id, data);
          setEntries((prev) =>
            prev.map((e) => (e.id === updated.id ? { ...updated, name: updated.person_name || updated.name } : e))
          );
        } else {
          // Create new entry
          const created = await api.createEntry(dateStr, data);
          setEntries((prev) => [...prev, { ...created, name: created.person_name || created.name }]);
        }

        setSelectedDate(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save entry';
        setError(message);
      }
    },
    [selectedDate, entries]
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setSelectedDate(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(message);
    }
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {loading && (
        <div className="text-center py-4 text-gray-600">Loading entries...</div>
      )}
      {!loading && (
        <>
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
        </>
      )}
    </div>
  );
}

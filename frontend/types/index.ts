export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  photo_url: string;
  name: string;
  location?: string;
  time_of_day: TimeOfDay;
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EntryFormData {
  photo: File | null;
  photo_url?: string;
  name: string;
  location: string;
  time_of_day: TimeOfDay;
  memo: string;
}

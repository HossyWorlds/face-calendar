import { Entry } from '@/types';

export const mockEntries: Entry[] = [
  {
    id: '1',
    date: '2025-01-15',
    photo_url: 'https://i.pravatar.cc/150?img=1',
    name: '田中さん',
    location: '渋谷',
    time_of_day: 'evening',
    memo: '久しぶりに会った',
  },
  {
    id: '2',
    date: '2025-01-08',
    photo_url: 'https://i.pravatar.cc/150?img=2',
    name: '佐藤さん',
    location: '新宿',
    time_of_day: 'afternoon',
    memo: 'ランチした',
  },
  {
    id: '3',
    date: '2025-01-03',
    photo_url: 'https://i.pravatar.cc/150?img=3',
    name: '山田さん',
    location: '池袋',
    time_of_day: 'morning',
    memo: '',
  },
  {
    id: '4',
    date: '2025-01-22',
    photo_url: 'https://i.pravatar.cc/150?img=4',
    name: '鈴木さん',
    location: '品川',
    time_of_day: 'evening',
    memo: '仕事の話',
  },
  {
    id: '5',
    date: '2024-12-25',
    photo_url: 'https://i.pravatar.cc/150?img=5',
    name: '高橋さん',
    location: '横浜',
    time_of_day: 'afternoon',
    memo: 'クリスマスパーティー',
  },
];

// Helper to get entries by month
export function getEntriesByMonth(year: number, month: number): Entry[] {
  return mockEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month;
  });
}

// Helper to get entry by date
export function getEntryByDate(date: string): Entry | undefined {
  return mockEntries.find((entry) => entry.date === date);
}

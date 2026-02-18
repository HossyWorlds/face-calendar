import { auth } from '@/lib/firebase';
import { Entry, EntryFormData } from '@/types';
import { getIdToken } from 'firebase/auth';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// バックエンドのベースURL（画像等の静的ファイル参照用）
const BACKEND_BASE_URL = API_URL.replace(/\/api\/v1$/, '');

// バックエンドの相対パス（/uploads/...）を絶対URLに変換する
export function resolveBackendUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
}

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  return await getIdToken(user);
}

async function request<T>(
  method: string,
  endpoint: string,
  body?: FormData | Record<string, any>
): Promise<T> {
  const token = await getAuthToken();
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  if (response.status === 204) {
    return {} as T; // No content
  }

  return response.json();
}

export const api = {
  // Get entries for a specific month
  getEntries: async (year: number, month: number): Promise<Entry[]> => {
    const response = await request<{ entries: Entry[] }>(
      'GET',
      `/encounters?year=${year}&month=${month}`
    );
    return response.entries || [];
  },

  // Create a new entry
  createEntry: async (
    date: string,
    formData: EntryFormData
  ): Promise<Entry> => {
    const data = new FormData();
    data.append('date', date);
    data.append('person_name', formData.name);
    data.append('location', formData.location);
    data.append('time_of_day', formData.time_of_day);
    data.append('memo', formData.memo);

    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    return request<Entry>('POST', '/encounters', data);
  },

  // Update an existing entry
  updateEntry: async (id: string, formData: EntryFormData): Promise<Entry> => {
    const data = new FormData();
    data.append('person_name', formData.name);
    data.append('location', formData.location);
    data.append('time_of_day', formData.time_of_day);
    data.append('memo', formData.memo);

    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    return request<Entry>('PUT', `/encounters/${id}`, data);
  },

  // Delete an entry
  deleteEntry: async (id: string): Promise<void> => {
    await request('DELETE', `/encounters/${id}`);
  },
};

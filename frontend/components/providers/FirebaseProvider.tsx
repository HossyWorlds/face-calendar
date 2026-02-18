'use client';

import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await getIdToken(user);
          document.cookie = `firebaseToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        } catch (error) {
          console.error('Failed to set auth token:', error);
        }
      } else {
        // Clear token if user logs out
        document.cookie = 'firebaseToken=; path=/; max-age=0';
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}

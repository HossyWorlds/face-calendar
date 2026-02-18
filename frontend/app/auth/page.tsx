'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await getIdToken(user);
        document.cookie = `firebaseToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const token = await getIdToken(result.user);
      document.cookie = `firebaseToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログイン失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Face Calendar
        </h1>
        <p className="text-center text-gray-600 mb-8">
          お気に入りの人の思い出を記録しよう
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-6 text-lg font-semibold"
        >
          {loading ? 'ログイン中...' : 'Google でログイン'}
        </Button>

        <p className="text-center text-gray-500 text-sm mt-6">
          Google アカウントでサインインしてください
        </p>
      </div>
    </div>
  );
}

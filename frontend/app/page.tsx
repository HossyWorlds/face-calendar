'use client';

import { Calendar } from '@/components/Calendar/Calendar';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = 'firebaseToken=; path=/; max-age=0';
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-4 px-4 flex justify-end">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-sm"
        >
          ログアウト
        </Button>
      </div>
      <Calendar />
    </div>
  );
}

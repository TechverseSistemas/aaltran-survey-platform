'use client';
import { useAuthContext } from '@/context/authContext';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { userAuth } = useAuthContext();
  const router = useRouter();

  if (!userAuth) {
    router.push('/login');
    return null; // Prevents rendering while redirecting
  }
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p>Welcome, {userAuth.email}!</p>
    </div>
  );
}

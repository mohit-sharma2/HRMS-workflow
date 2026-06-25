'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('hrms_user') : null;
    router.replace(stored ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
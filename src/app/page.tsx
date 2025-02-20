'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [state.isAuthenticated, router]);

  return (
    <Link to="/mint">Mint Your First Holobot</Link>
  );
} 
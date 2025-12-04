'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FullPageLoader } from '@/components/ui/Spinner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated, setHasHydrated } = useAuthStore();

  // Set hydration flag on mount if not already set
  useEffect(() => {
    if (!_hasHydrated) {
      setHasHydrated(true);
    }
  }, [_hasHydrated, setHasHydrated]);

  useEffect(() => {
    // Only redirect after hydration is complete
    if (_hasHydrated) {
      if (isAuthenticated && user) {
        // Redirect based on role
        if (user.role === 'CLIENT') {
          router.push('/portal');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, _hasHydrated, router]);

  return <FullPageLoader />;
}


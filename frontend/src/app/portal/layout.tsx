'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { PortalSidebar } from '@/components/layout/PortalSidebar';
import { Header } from '@/components/layout/Header';
import { FullPageLoader } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated, setHasHydrated } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Set hydration flag on mount if not already set
  useEffect(() => {
    if (!_hasHydrated) {
      setHasHydrated(true);
    }
  }, [_hasHydrated, setHasHydrated]);

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'CLIENT') {
        router.push('/dashboard');
      }
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated) return <FullPageLoader />;
  if (!isAuthenticated || user?.role !== 'CLIENT') return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-slate-950">
      <PortalSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')}>
        <Header />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}


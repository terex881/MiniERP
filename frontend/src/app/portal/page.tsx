'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, MessageSquare, DollarSign, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useDashboard } from '@/hooks/useDashboard';
import { ClientPortalStats } from '@/types';
import { formatCurrency, formatRelativeTime, statusColors } from '@/lib/utils';

export default function PortalDashboardPage() {
  const { getClientDashboard, isLoading } = useDashboard();
  const [stats, setStats] = useState<ClientPortalStats | null>(null);

  useEffect(() => {
    getClientDashboard().then(setStats).catch(() => {});
  }, []);

  if (isLoading || !stats) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Welcome, {stats.profile.firstName}!</h1>
          <p className="text-slate-400 mt-1">Here&apos;s your account overview</p>
        </div>
        <Link href="/portal/claims/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>New Claim</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{stats.subscriptions.active}</p>
                <p className="text-sm text-slate-400">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{stats.claims.open}</p>
                <p className="text-sm text-slate-400">Open Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.subscriptions.monthlySpend)}</p>
                <p className="text-sm text-slate-400">Monthly Spend</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Claims</CardTitle>
          <Link href="/portal/claims">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentClaims.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No claims yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentClaims.map((claim) => (
                <Link key={claim.id} href={`/portal/claims/${claim.id}`}>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                    <div>
                      <p className="font-medium text-slate-200">{claim.title}</p>
                      <p className="text-sm text-slate-500">{formatRelativeTime(claim.createdAt)}</p>
                    </div>
                    <Badge className={statusColors[claim.status as keyof typeof statusColors]}>{claim.status.replace('_', ' ')}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


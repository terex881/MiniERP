'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Target,
  Building2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/store/authStore';
import { DashboardStats } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getAdminDashboard, getSupervisorDashboard, getOperatorDashboard, isLoading } = useDashboard();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        let data;
        switch (user?.role) {
          case 'ADMIN':
            data = await getAdminDashboard();
            break;
          case 'SUPERVISOR':
            data = await getSupervisorDashboard();
            break;
          default:
            data = await getOperatorDashboard();
        }
        setStats(data);
      } catch (error) {
        // Error handled in hook
      }
    };

    fetchDashboard();
  }, [user?.role]);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users (Admin only) */}
        {stats.users && (
          <StatsCard
            title="Total Users"
            value={stats.users.total}
            subtitle={`${stats.users.active} active`}
            icon={Users}
            trend={+5.2}
            color="blue"
          />
        )}

        {/* Leads */}
        <StatsCard
          title="Total Leads"
          value={stats.leads.total}
          subtitle={`${stats.leads.new} new this month`}
          icon={Target}
          trend={stats.leads.conversionRate}
          trendLabel="conversion"
          color="purple"
        />

        {/* Clients */}
        <StatsCard
          title="Active Clients"
          value={stats.clients.active}
          subtitle={`${stats.clients.withSubscriptions} with subscriptions`}
          icon={Building2}
          trend={+2.4}
          color="green"
        />

        {/* Claims */}
        <StatsCard
          title="Open Claims"
          value={stats.claims.open + stats.claims.inProgress}
          subtitle={`${stats.claims.resolved} resolved`}
          icon={MessageSquare}
          trend={-12.5}
          color="amber"
        />
      </div>

      {/* Revenue (Admin/Supervisor) */}
      {stats.revenue && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="elevated" className="overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-2xl" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary-400" />
                </div>
                <Badge variant="success">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2%
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-1">Monthly Recurring Revenue</p>
              <p className="text-3xl font-display font-bold text-slate-100">
                {formatCurrency(stats.revenue.monthlyRecurring)}
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-500/10 to-transparent rounded-full blur-2xl" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-1">Projected Yearly Revenue</p>
              <p className="text-3xl font-display font-bold text-slate-100">
                {formatCurrency(stats.revenue.yearlyProjected)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        by {activity.user.firstName} {activity.user.lastName}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Badge size="sm">{activity.action}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  trendLabel?: string;
  color: 'blue' | 'purple' | 'green' | 'amber';
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, trendLabel, color }: StatsCardProps) {
  const colors = {
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-400',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-400',
    green: 'from-green-500/10 to-green-500/5 text-green-400',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-400',
  };

  const iconColors = {
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    green: 'bg-green-500/10 text-green-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <Card className="overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-50`} />
      <CardContent className="pt-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg ${iconColors[color]} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend).toFixed(1)}%
              {trendLabel && <span className="text-slate-500 ml-1">{trendLabel}</span>}
            </div>
          )}
        </div>
        <p className="text-2xl font-display font-bold text-slate-100">{value.toLocaleString()}</p>
        <p className="text-sm text-slate-400 mt-1">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </CardContent>
    </Card>
  );
}


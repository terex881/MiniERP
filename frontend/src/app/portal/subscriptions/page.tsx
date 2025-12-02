'use client';

import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import api, { getErrorMessage } from '@/lib/api';
import { ClientProduct } from '@/types';
import { formatCurrency, billingCycleLabels, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PortalSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<ClientProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await api.get('/portal/subscriptions');
        setSubscriptions(response.data.data || []);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const price = sub.customPrice || Number(sub.product.price);
    let monthly = price * sub.quantity;
    if (sub.product.billingCycle === 'yearly') monthly = monthly / 12;
    if (sub.product.billingCycle === 'one-time') monthly = 0;
    return sum + monthly;
  }, 0);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100">My Subscriptions</h1>
        <p className="text-slate-400 mt-1">View your active products and services</p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-accent-500/10 to-transparent border-accent-500/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Monthly Total</p>
              <p className="text-3xl font-display font-bold text-accent-400">{formatCurrency(totalMonthly)}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-accent-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader><CardTitle>Active Subscriptions</CardTitle></CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <EmptyState title="No subscriptions" description="You don't have any active subscriptions." />
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{sub.product.name}</p>
                      <p className="text-sm text-slate-400">
                        Started {formatDate(sub.startDate)}
                        {sub.quantity > 1 && ` • Qty: ${sub.quantity}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-200">
                      {formatCurrency(sub.customPrice || Number(sub.product.price))}
                    </p>
                    <Badge size="sm">{billingCycleLabels[sub.product.billingCycle]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


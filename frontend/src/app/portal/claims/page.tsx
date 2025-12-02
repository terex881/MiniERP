'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import api, { getErrorMessage } from '@/lib/api';
import { Claim, ClaimStatus, ApiResponse } from '@/types';
import { formatDate, statusColors, priorityColors } from '@/lib/utils';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function PortalClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchClaims = async (opts?: { page?: number }) => {
    setIsLoading(true);
    try {
      const params = { search, status: statusFilter, page: opts?.page || 1 };
      const response = await api.get<ApiResponse<Claim[]>>('/portal/claims', { params });
      setClaims(response.data.data || []);
      if (response.data.meta) setMeta(response.data.meta);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">My Claims</h1>
          <p className="text-slate-400 mt-1">Track your support requests</p>
        </div>
        <Link href="/portal/claims/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>New Claim</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search claims..." leftIcon={<Search className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : claims.length === 0 ? (
            <EmptyState
              title="No claims found"
              description="You haven't submitted any claims yet."
              actionLabel="Submit a Claim"
              onAction={() => window.location.href = '/portal/claims/new'}
            />
          ) : (
            <div className="divide-y divide-slate-700/50">
              {claims.map((claim) => (
                <Link key={claim.id} href={`/portal/claims/${claim.id}`}>
                  <div className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{claim.title}</p>
                      <p className="text-sm text-slate-500 line-clamp-1 mt-1">{claim.description}</p>
                      <p className="text-xs text-slate-600 mt-2">{formatDate(claim.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={priorityColors[claim.priority]}>{claim.priority}</Badge>
                      <Badge className={statusColors[claim.status]}>{claim.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={(page) => fetchClaims({ page })} />
        </div>
      )}
    </div>
  );
}


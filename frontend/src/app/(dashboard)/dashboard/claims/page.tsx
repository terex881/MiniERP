'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, UserPlus, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useClaims } from '@/hooks/useClaims';
import { useUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/authStore';
import { Claim, ClaimStatus, ClaimPriority, AssignableUser } from '@/types';
import { formatDate, statusColors, priorityColors } from '@/lib/utils';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function ClaimsPage() {
  const { user } = useAuthStore();
  const { claims, meta, isLoading, fetchClaims, deleteClaim, updateStatus, assignClaim } = useClaims();
  const { getAssignableUsers } = useUsers();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; claim: Claim | null }>({ open: false, claim: null });
  const [assignModal, setAssignModal] = useState<{ open: boolean; claim: Claim | null }>({ open: false, claim: null });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchClaims({ search, status: statusFilter as ClaimStatus | undefined, priority: priorityFilter as ClaimPriority | undefined });
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    getAssignableUsers().then(setAssignableUsers).catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.claim) return;
    setIsDeleting(true);
    try {
      await deleteClaim(deleteModal.claim.id);
      fetchClaims({ search, status: statusFilter as ClaimStatus | undefined });
      setDeleteModal({ open: false, claim: null });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (claim: Claim, status: ClaimStatus) => {
    await updateStatus(claim.id, status);
    fetchClaims({ search, status: statusFilter as ClaimStatus | undefined });
  };

  const handleAssign = async () => {
    if (!assignModal.claim) return;
    await assignClaim(assignModal.claim.id, selectedUserId || null);
    fetchClaims({ search, status: statusFilter as ClaimStatus | undefined });
    setAssignModal({ open: false, claim: null });
    setSelectedUserId('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Claims</h1>
          <p className="text-slate-400 mt-1">Manage customer support claims</p>
        </div>
        <Link href="/dashboard/claims/new">
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
            <Select options={priorityOptions} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full md:w-40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : claims.length === 0 ? (
            <EmptyState title="No claims found" description="No claims match your criteria." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-slate-100 line-clamp-1">{claim.title}</p>
                          {claim.attachments.length > 0 && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Paperclip className="w-3 h-3" /> {claim.attachments.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-300">{claim.client.firstName} {claim.client.lastName}</p>
                      <p className="text-xs text-slate-500">{claim.client.company}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        options={statusOptions.filter(s => s.value)}
                        value={claim.status}
                        onChange={(e) => handleStatusChange(claim, e.target.value as ClaimStatus)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell><Badge className={priorityColors[claim.priority]}>{claim.priority}</Badge></TableCell>
                    <TableCell className="text-slate-400">
                      {claim.assignedTo ? `${claim.assignedTo.firstName} ${claim.assignedTo.lastName}` : '-'}
                    </TableCell>
                    <TableCell className="text-slate-400">{formatDate(claim.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/claims/${claim.id}`}>
                          <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        </Link>
                        {canManage && (
                          <Button variant="ghost" size="sm" onClick={() => setAssignModal({ open: true, claim })}>
                            <UserPlus className="w-4 h-4 text-blue-400" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, claim })}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={(page) => fetchClaims({ page })} />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, claim: null })}
        onConfirm={handleDelete}
        title="Delete Claim"
        message={`Are you sure you want to delete "${deleteModal.claim?.title}"?`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      <Modal isOpen={assignModal.open} onClose={() => setAssignModal({ open: false, claim: null })} title="Assign Claim" size="sm">
        <div className="space-y-4">
          <Select
            label="Assign to"
            placeholder="Select user"
            options={[{ value: '', label: 'Unassigned' }, ...assignableUsers.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))]}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          />
          <div className="flex gap-3">
            <Button onClick={handleAssign}>Assign</Button>
            <Button variant="outline" onClick={() => setAssignModal({ open: false, claim: null })}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


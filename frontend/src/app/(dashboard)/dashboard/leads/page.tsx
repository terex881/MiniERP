'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, UserPlus, ArrowRightCircle } from 'lucide-react';
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
import { useLeads } from '@/hooks/useLeads';
import { useUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/authStore';
import { Lead, LeadStatus, AssignableUser } from '@/types';
import { formatDate, statusColors, formatCurrency } from '@/lib/utils';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

export default function LeadsPage() {
  const { user } = useAuthStore();
  const { leads, meta, isLoading, fetchLeads, deleteLead, updateStatus, assignLead, convertLead } = useLeads();
  const { getAssignableUsers } = useUsers();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [assignModal, setAssignModal] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [convertModal, setConvertModal] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  useEffect(() => {
    fetchLeads({ search, status: statusFilter as LeadStatus | undefined });
  }, [search, statusFilter]);

  useEffect(() => {
    getAssignableUsers().then(setAssignableUsers).catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.lead) return;
    setIsDeleting(true);
    try {
      await deleteLead(deleteModal.lead.id);
      fetchLeads({ search, status: statusFilter as LeadStatus | undefined });
      setDeleteModal({ open: false, lead: null });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    await updateStatus(lead.id, status);
    fetchLeads({ search, status: statusFilter as LeadStatus | undefined });
  };

  const handleAssign = async () => {
    if (!assignModal.lead) return;
    await assignLead(assignModal.lead.id, selectedUserId || null);
    fetchLeads({ search, status: statusFilter as LeadStatus | undefined });
    setAssignModal({ open: false, lead: null });
    setSelectedUserId('');
  };

  const handleConvert = async () => {
    if (!convertModal.lead) return;
    setIsConverting(true);
    try {
      await convertLead(convertModal.lead.id, { createPortalAccount: false });
      fetchLeads({ search, status: statusFilter as LeadStatus | undefined });
      setConvertModal({ open: false, lead: null });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Leads</h1>
          <p className="text-slate-400 mt-1">Track and convert your sales leads</p>
        </div>
        <Link href="/dashboard/leads/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Add Lead</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search leads..."
                leftIcon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-44"
            />
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : leads.length === 0 ? (
            <EmptyState
              title="No leads found"
              description="Start by creating your first lead."
              actionLabel="Add Lead"
              onAction={() => window.location.href = '/dashboard/leads/new'}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-100">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-sm text-slate-400">{lead.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {lead.company || '-'}
                    </TableCell>
                    <TableCell>
                      <Select
                        options={statusOptions.filter(s => s.value)}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                        className="w-32"
                        disabled={lead.status === 'CONVERTED'}
                      />
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {lead.estimatedValue ? formatCurrency(Number(lead.estimatedValue)) : '-'}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {lead.assignedTo
                        ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        {canManage && lead.status !== 'CONVERTED' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAssignModal({ open: true, lead })}
                            >
                              <UserPlus className="w-4 h-4 text-blue-400" />
                            </Button>
                            {lead.status === 'QUALIFIED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConvertModal({ open: true, lead })}
                              >
                                <ArrowRightCircle className="w-4 h-4 text-green-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteModal({ open: true, lead })}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </>
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

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(page) => fetchLeads({ page })}
          />
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, lead: null })}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteModal.lead?.firstName} ${deleteModal.lead?.lastName}?`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      {/* Assign Modal */}
      <Modal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, lead: null })}
        title="Assign Lead"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Assign to"
            placeholder="Select user"
            options={[
              { value: '', label: 'Unassigned' },
              ...assignableUsers.map(u => ({
                value: u.id,
                label: `${u.firstName} ${u.lastName}`,
              })),
            ]}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          />
          <div className="flex gap-3">
            <Button onClick={handleAssign}>Assign</Button>
            <Button variant="outline" onClick={() => setAssignModal({ open: false, lead: null })}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Convert Modal */}
      <ConfirmModal
        isOpen={convertModal.open}
        onClose={() => setConvertModal({ open: false, lead: null })}
        onConfirm={handleConvert}
        title="Convert to Client"
        message={`Convert ${convertModal.lead?.firstName} ${convertModal.lead?.lastName} to a client? This will create a new client record.`}
        confirmText="Convert"
        variant="info"
        isLoading={isConverting}
      />
    </div>
  );
}


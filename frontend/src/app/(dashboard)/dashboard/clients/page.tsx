'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, DollarSign, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useClients } from '@/hooks/useClients';
import { useAuthStore } from '@/store/authStore';
import { Client } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ClientsPage() {
  const { user } = useAuthStore();
  const { clients, meta, isLoading, fetchClients, deleteClient, createPortalAccount } = useClients();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; client: Client | null }>({ open: false, client: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchClients({ search });
  }, [search]);

  const handleDelete = async () => {
    if (!deleteModal.client) return;
    setIsDeleting(true);
    try {
      await deleteClient(deleteModal.client.id);
      fetchClients({ search });
      setDeleteModal({ open: false, client: null });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreatePortal = async (client: Client) => {
    await createPortalAccount(client.id);
    fetchClients({ search });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Clients</h1>
          <p className="text-slate-400 mt-1">Manage your client relationships</p>
        </div>
        {canManage && (
          <Link href="/dashboard/clients/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>Add Client</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="py-4">
          <Input
            placeholder="Search clients..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : clients.length === 0 ? (
            <EmptyState title="No clients found" description="Get started by creating your first client." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Portal</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-100">{client.firstName} {client.lastName}</p>
                        <p className="text-sm text-slate-400">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{client.company || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={client.isActive ? 'success' : 'default'}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {client.hasPortalAccess ? (
                        <Badge variant="info">Has Access</Badge>
                      ) : (
                        isAdmin && (
                          <Button variant="ghost" size="sm" onClick={() => handleCreatePortal(client)}>
                            <KeyRound className="w-4 h-4 mr-1" /> Create
                          </Button>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-slate-400">{formatDate(client.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        </Link>
                        {isAdmin && (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, client })}>
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
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={(page) => fetchClients({ page })} />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, client: null })}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete ${deleteModal.client?.firstName} ${deleteModal.client?.lastName}?`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}


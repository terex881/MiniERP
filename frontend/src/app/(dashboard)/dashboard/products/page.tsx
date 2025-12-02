'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useProducts } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types';
import { formatCurrency, billingCycleLabels } from '@/lib/utils';

export default function ProductsPage() {
  const { user } = useAuthStore();
  const { products, meta, isLoading, fetchProducts, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchProducts({ search });
  }, [search]);

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteModal.product.id);
      fetchProducts({ search });
      setDeleteModal({ open: false, product: null });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Products</h1>
          <p className="text-slate-400 mt-1">Manage your products and services</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/products/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>Add Product</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="py-4">
          <Input
            placeholder="Search products..."
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
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Create your first product to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-100">{product.name}</p>
                        <p className="text-sm text-slate-400 line-clamp-1">{product.description || 'No description'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-200">{formatCurrency(Number(product.price))}</TableCell>
                    <TableCell><Badge>{billingCycleLabels[product.billingCycle]}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'success' : 'default'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">{product._count?.clientProducts || 0}</TableCell>
                    <TableCell>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, product })}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      )}
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
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={(page) => fetchProducts({ page })} />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.product?.name}"?`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}


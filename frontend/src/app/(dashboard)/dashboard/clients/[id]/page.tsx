'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2,DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { Client, Product, ClientIncome } from '@/types';
import { formatCurrency, billingCycleLabels } from '@/lib/utils';

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const { getClient, updateClient, addProduct, removeProduct, getClientIncome } = useClients();
  const { fetchActiveProducts } = useProducts();
  
  const [client, setClient] = useState<Client | null>(null);
  const [income, setIncome] = useState<ClientIncome | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, incomeData, productsData] = await Promise.all([
          getClient(clientId),
          getClientIncome(clientId).catch(() => null),
          fetchActiveProducts(),
        ]);
        setClient(clientData);
        setIncome(incomeData);
        setProducts(productsData || []);
      } catch {
        router.push('/dashboard/clients');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const handleAddProduct = async () => {
    if (!selectedProduct) return;
    await addProduct(clientId, selectedProduct, quantity);
    const [clientData, incomeData] = await Promise.all([getClient(clientId), getClientIncome(clientId).catch(() => null)]);
    setClient(clientData);
    setIncome(incomeData);
    setAddModal(false);
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveProduct = async (productId: string) => {
    await removeProduct(clientId, productId);
    const [clientData, incomeData] = await Promise.all([getClient(clientId), getClientIncome(clientId).catch(() => null)]);
    setClient(clientData);
    setIncome(incomeData);
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!client) return null;

  const availableProducts = products.filter(p => !client.subscriptions?.some(s => s.product.id === p.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-100">{client.firstName} {client.lastName}</h1>
            <p className="text-slate-400">{client.email}</p>
          </div>
        </div>
        <Badge variant={client.isActive ? 'success' : 'default'}>{client.isActive ? 'Active' : 'Inactive'}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Company:</span> <span className="text-slate-200 ml-2">{client.company || '-'}</span></div>
              <div><span className="text-slate-400">Phone:</span> <span className="text-slate-200 ml-2">{client.phone || '-'}</span></div>
              <div><span className="text-slate-400">Address:</span> <span className="text-slate-200 ml-2">{client.address || '-'}</span></div>
              <div><span className="text-slate-400">City:</span> <span className="text-slate-200 ml-2">{client.city || '-'}</span></div>
              <div><span className="text-slate-400">State:</span> <span className="text-slate-200 ml-2">{client.state || '-'}</span></div>
              <div><span className="text-slate-400">Country:</span> <span className="text-slate-200 ml-2">{client.country || '-'}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Income Summary */}
        {income && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400" /> Revenue</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Monthly</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(income.monthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Yearly</p>
                  <p className="text-lg font-medium text-slate-200">{formatCurrency(income.yearlyIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Subscriptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subscriptions</CardTitle>
          {availableProducts.length > 0 && (
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>Add Product</Button>
          )}
        </CardHeader>
        <CardContent>
          {client.subscriptions?.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No subscriptions</p>
          ) : (
            <div className="space-y-3">
              {client.subscriptions?.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-200">{sub.product.name}</p>
                    <p className="text-sm text-slate-400">
                      {formatCurrency(sub.customPrice || Number(sub.product.price))} / {billingCycleLabels[sub.product.billingCycle]}
                      {sub.quantity > 1 && ` × ${sub.quantity}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveProduct(sub.product.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Product" size="sm">
        <div className="space-y-4">
          <Select
            label="Product"
            placeholder="Select product"
            options={availableProducts.map(p => ({ value: p.id, label: `${p.name} - ${formatCurrency(Number(p.price))}` }))}
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          />
          <Input label="Quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          <div className="flex gap-3">
            <Button onClick={handleAddProduct} disabled={!selectedProduct}>Add Product</Button>
            <Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


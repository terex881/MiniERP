'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useProducts } from '@/hooks/useProducts';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive(),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']),
  isActive: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

const billingOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { getProduct, updateProduct } = useProducts();
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    getProduct(productId).then(data => {
      reset({
        name: data.name,
        description: data.description || '',
        price: Number(data.price),
        billingCycle: data.billingCycle as 'monthly' | 'yearly' | 'one-time',
        isActive: data.isActive,
      });
      setIsLoading(false);
    }).catch(() => router.push('/dashboard/products'));
  }, [productId]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      await updateProduct(productId, data);
      router.push('/dashboard/products');
    } catch {}
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Edit Product</h1>
          <p className="text-slate-400 mt-1">Update product details</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" rows={3} {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price" type="number" step="0.01" {...register('price')} />
              <Select label="Billing Cycle" options={billingOptions} {...register('billingCycle')} />
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500" {...register('isActive')} />
              <span className="text-sm text-slate-300">Active</span>
            </label>
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
              <Link href="/dashboard/products"><Button variant="outline" type="button">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


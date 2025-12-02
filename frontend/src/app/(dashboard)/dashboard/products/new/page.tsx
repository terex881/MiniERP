'use client';

import { useRouter } from 'next/navigation';
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
import { useProducts } from '@/hooks/useProducts';

const productSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']),
});

type ProductFormData = z.infer<typeof productSchema>;

const billingOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct } = useProducts();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { billingCycle: 'monthly' },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      await createProduct(data);
      router.push('/dashboard/products');
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">New Product</h1>
          <p className="text-slate-400 mt-1">Create a new product or service</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" rows={3} {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
              <Select label="Billing Cycle" options={billingOptions} {...register('billingCycle')} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>Create Product</Button>
              <Link href="/dashboard/products"><Button variant="outline" type="button">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


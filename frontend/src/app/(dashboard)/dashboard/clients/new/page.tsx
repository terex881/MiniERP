'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useClients } from '@/hooks/useClients';

const clientSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const { createClient } = useClients();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      await createClient(data);
      router.push('/dashboard/clients');
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">New Client</h1>
          <p className="text-slate-400 mt-1">Create a new client</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" error={errors.email?.message} {...register('email')} />
              <Input label="Phone" {...register('phone')} />
            </div>
            <Input label="Company" {...register('company')} />
            <Input label="Address" {...register('address')} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="City" {...register('city')} />
              <Input label="State" {...register('state')} />
              <Input label="Zip Code" {...register('zipCode')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Country" {...register('country')} />
              <Input label="Tax ID" {...register('taxId')} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>Create Client</Button>
              <Link href="/dashboard/clients"><Button variant="outline" type="button">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


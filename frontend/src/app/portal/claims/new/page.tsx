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
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

const claimSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type ClaimFormData = z.infer<typeof claimSchema>;

const priorityOptions = [
  { value: 'LOW', label: 'Low - General inquiry' },
  { value: 'MEDIUM', label: 'Medium - Need assistance' },
  { value: 'HIGH', label: 'High - Urgent issue' },
  { value: 'URGENT', label: 'Urgent - Critical problem' },
];

export default function NewPortalClaimPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  const onSubmit = async (data: ClaimFormData) => {
    try {
      await api.post('/portal/claims', data);
      toast.success('Claim submitted successfully');
      router.push('/portal/claims');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/portal/claims"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Submit a Claim</h1>
          <p className="text-slate-400 mt-1">Let us know how we can help</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Claim Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Title" placeholder="Brief summary of your issue" error={errors.title?.message} {...register('title')} />
            <Textarea label="Description" placeholder="Please describe your issue in detail..." rows={6} error={errors.description?.message} {...register('description')} />
            <Select label="Priority" options={priorityOptions} error={errors.priority?.message} {...register('priority')} />
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>Submit Claim</Button>
              <Link href="/portal/claims"><Button variant="outline" type="button">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


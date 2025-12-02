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
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/types';

const leadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  estimatedValue: z.coerce.number().positive().optional().nullable(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  const { getLead, updateLead } = useLeads();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  useEffect(() => {
    getLead(leadId).then(data => {
      setLead(data);
      reset({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        source: data.source || '',
        notes: data.notes || '',
        estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : undefined,
      });
      setIsLoading(false);
    }).catch(() => router.push('/dashboard/leads'));
  }, [leadId]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      await updateLead(leadId, data);
      router.push('/dashboard/leads');
    } catch {}
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Edit Lead</h1>
          <p className="text-slate-400 mt-1">Update lead details</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Lead Information</CardTitle></CardHeader>
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
            <Input label="Estimated Value" type="number" {...register('estimatedValue')} />
            <Textarea label="Notes" rows={3} {...register('notes')} />
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
              <Link href="/dashboard/leads"><Button variant="outline" type="button">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


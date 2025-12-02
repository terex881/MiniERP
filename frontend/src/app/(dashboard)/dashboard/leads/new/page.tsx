'use client';

import { useEffect, useState } from 'react';
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
import { useLeads } from '@/hooks/useLeads';
import { useUsers } from '@/hooks/useUsers';
import { AssignableUser } from '@/types';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  estimatedValue: z.coerce.number().positive().optional().or(z.literal('')),
  assignedToId: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

const sourceOptions = [
  { value: '', label: 'Select source' },
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Trade Show', label: 'Trade Show' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Other', label: 'Other' },
];

export default function NewLeadPage() {
  const router = useRouter();
  const { createLead } = useLeads();
  const { getAssignableUsers } = useUsers();
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  useEffect(() => {
    getAssignableUsers().then(setAssignableUsers).catch(() => {});
  }, []);

  const onSubmit = async (data: LeadFormData) => {
    try {
      await createLead({
        ...data,
        estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : undefined,
      });
      router.push('/dashboard/leads');
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">New Lead</h1>
          <p className="text-slate-400 mt-1">Create a new sales lead</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Phone" type="tel" {...register('phone')} />
            </div>

            <Input label="Company" {...register('company')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Source" options={sourceOptions} {...register('source')} />
              <Input label="Estimated Value" type="number" step="0.01" {...register('estimatedValue')} />
            </div>

            <Select
              label="Assign To"
              options={[
                { value: '', label: 'Unassigned' },
                ...assignableUsers.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` })),
              ]}
              {...register('assignedToId')}
            />

            <Textarea label="Notes" rows={3} {...register('notes')} />

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>Create Lead</Button>
              <Link href="/dashboard/leads">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


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
import { useClaims } from '@/hooks/useClaims';
import { useClients } from '@/hooks/useClients';
import { useUsers } from '@/hooks/useUsers';
import { Client, AssignableUser } from '@/types';

const claimSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  clientId: z.string().min(1, 'Required'),
  assignedToId: z.string().optional(),
});

type ClaimFormData = z.infer<typeof claimSchema>;

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function NewClaimPage() {
  const router = useRouter();
  const { createClaim } = useClaims();
  const { fetchClients } = useClients();
  const { getAssignableUsers } = useUsers();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  useEffect(() => {
    fetchClients({ limit: 100 }).then(data => setClients(data || [])).catch(() => {});
    getAssignableUsers().then(setAssignableUsers).catch(() => {});
  }, []);

  const onSubmit = async (data: ClaimFormData) => {
    try {
      await createClaim(data);
      router.push('/dashboard/claims');
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/claims"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">New Claim</h1>
          <p className="text-slate-400 mt-1">Create a new support claim</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Claim Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Title" error={errors.title?.message} {...register('title')} />
            <Textarea label="Description" rows={4} error={errors.description?.message} {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Client"
                placeholder="Select client"
                options={clients.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}${c.company ? ` (${c.company})` : ''}` }))}
                error={errors.clientId?.message}
                {...register('clientId')}
              />
              <Select label="Priority" options={priorityOptions} {...register('priority')} />
            </div>
            <Select
              label="Assign To"
              placeholder="Unassigned"
              options={[{ value: '', label: 'Unassigned' }, ...assignableUsers.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))]}
              {...register('assignedToId')}
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>Create Claim</Button>
              <Link href="/dashboard/claims"><Button variant="outline" type="button">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


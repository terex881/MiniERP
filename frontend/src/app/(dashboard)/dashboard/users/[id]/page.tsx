'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Key } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'OPERATOR', 'CLIENT']),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

const roleOptions = [
  { value: 'OPERATOR', label: 'Operator' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'CLIENT', label: 'Client' },
];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { getUser, updateUser, resetPassword } = useUsers();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resetModal, setResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser(userId);
        setUser(data);
        reset({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          role: data.role,
          isActive: data.isActive,
        });
      } catch (error) {
        router.push('/dashboard/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const onSubmit = async (data: UserFormData) => {
    try {
      await updateUser(userId, data);
      router.push('/dashboard/users');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    setIsResetting(true);
    try {
      await resetPassword(userId, newPassword);
      setResetModal(false);
      setNewPassword('');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-100">Edit User</h1>
            <p className="text-slate-400 mt-1">Update user account details</p>
          </div>
        </div>
        <Button
          variant="outline"
          leftIcon={<Key className="w-4 h-4" />}
          onClick={() => setResetModal(true)}
        >
          Reset Password
        </Button>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Select
              label="Role"
              options={roleOptions}
              error={errors.role?.message}
              {...register('role')}
            />

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500"
                {...register('isActive')}
              />
              <span className="text-sm text-slate-300">Active account</span>
            </label>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
              <Link href="/dashboard/users">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModal}
        onClose={() => setResetModal(false)}
        title="Reset Password"
        description={`Set a new password for ${user?.firstName} ${user?.lastName}`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex gap-3">
            <Button onClick={handleResetPassword} isLoading={isResetting}>
              Reset Password
            </Button>
            <Button variant="outline" onClick={() => setResetModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


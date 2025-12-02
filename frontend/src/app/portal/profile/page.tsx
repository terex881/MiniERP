'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Profile extends ProfileFormData {
  id: string;
  email: string;
  createdAt: string;
}

export default function PortalProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/portal/profile');
        const data = response.data.data;
        setProfile(data);
        reset({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          company: data.company || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          country: data.country || '',
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await api.put('/portal/profile', data);
      setProfile(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-3xl font-bold text-white mb-4">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </div>
              <h3 className="text-lg font-semibold text-slate-100">{profile?.firstName} {profile?.lastName}</h3>
              <p className="text-slate-400">{profile?.email}</p>
              {profile?.company && <p className="text-sm text-slate-500 mt-1">{profile.company}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
                <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone" {...register('phone')} />
                <Input label="Company" {...register('company')} />
              </div>
              <Input label="Address" {...register('address')} />
              <div className="grid grid-cols-3 gap-4">
                <Input label="City" {...register('city')} />
                <Input label="State" {...register('state')} />
                <Input label="Zip Code" {...register('zipCode')} />
              </div>
              <Input label="Country" {...register('country')} />
              <div className="pt-4">
                <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


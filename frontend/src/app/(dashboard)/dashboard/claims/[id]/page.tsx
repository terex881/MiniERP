'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Paperclip, Download, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useClaims } from '@/hooks/useClaims';
import { useAuthStore } from '@/store/authStore';
import { Claim, ClaimStatus, ClaimPriority } from '@/types';
import { formatDate, formatFileSize, statusColors, priorityColors } from '@/lib/utils';

const statusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function ClaimDetailPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = params.id as string;
  const { user } = useAuthStore();
  const { getClaim, updateClaim, updateStatus, uploadAttachment, deleteAttachment, downloadAttachment } = useClaims();
  
  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  useEffect(() => {
    getClaim(claimId).then(data => {
      setClaim(data);
      setResolution(data.resolution || '');
      setIsLoading(false);
    }).catch(() => router.push('/dashboard/claims'));
  }, [claimId]);

  const handleStatusChange = async (status: ClaimStatus) => {
    if (!claim) return;
    const updated = await updateStatus(claim.id, status, resolution);
    setClaim(updated);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !claim) return;
    setIsUploading(true);
    try {
      const updated = await uploadAttachment(claim.id, file);
      setClaim(updated);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!claim) return;
    const updated = await deleteAttachment(claim.id, attachmentId);
    setClaim(updated);
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!claim) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/claims"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-100">{claim.title}</h1>
            <p className="text-slate-400">Created {formatDate(claim.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[claim.status]}>{claim.status.replace('_', ' ')}</Badge>
          <Badge className={priorityColors[claim.priority]}>{claim.priority}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap">{claim.description}</p>
            </CardContent>
          </Card>

          {/* Resolution */}
          <Card>
            <CardHeader><CardTitle>Resolution</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter resolution notes..."
                rows={4}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
              <div className="mt-4 flex gap-3">
                <Select options={statusOptions} value={claim.status} onChange={(e) => handleStatusChange(e.target.value as ClaimStatus)} className="w-40" />
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Paperclip className="w-5 h-5" /> Attachments</CardTitle>
              <div>
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                <Button size="sm" leftIcon={<Upload className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()} isLoading={isUploading}>
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {claim.attachments.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No attachments</p>
              ) : (
                <div className="space-y-2">
                  {claim.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-slate-200">{att.originalName}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(att.size)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => downloadAttachment(claim.id, att.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        {canManage && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAttachment(att.id)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400">Client</p>
                <p className="text-slate-200">{claim.client.firstName} {claim.client.lastName}</p>
                <p className="text-slate-500">{claim.client.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Created By</p>
                <p className="text-slate-200">{claim.createdBy.firstName} {claim.createdBy.lastName}</p>
              </div>
              <div>
                <p className="text-slate-400">Assigned To</p>
                <p className="text-slate-200">{claim.assignedTo ? `${claim.assignedTo.firstName} ${claim.assignedTo.lastName}` : 'Unassigned'}</p>
              </div>
              {claim.resolvedAt && (
                <div>
                  <p className="text-slate-400">Resolved At</p>
                  <p className="text-slate-200">{formatDate(claim.resolvedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


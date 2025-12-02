'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Paperclip, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import api, { getErrorMessage } from '@/lib/api';
import { Claim } from '@/types';
import { formatDate, formatFileSize, statusColors, priorityColors } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PortalClaimDetailPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = params.id as string;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchClaim = async () => {
    try {
      const response = await api.get(`/portal/claims/${claimId}`);
      setClaim(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push('/portal/claims');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [claimId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/portal/claims/${claimId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded');
      fetchClaim();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!claim) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portal/claims"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-100">{claim.title}</h1>
            <p className="text-slate-400">Submitted {formatDate(claim.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[claim.status]}>{claim.status.replace('_', ' ')}</Badge>
          <Badge className={priorityColors[claim.priority]}>{claim.priority}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap">{claim.description}</p>
            </CardContent>
          </Card>

          {claim.resolution && (
            <Card className="border-green-500/30">
              <CardHeader><CardTitle className="text-green-400">Resolution</CardTitle></CardHeader>
              <CardContent>
                <p className="text-slate-300 whitespace-pre-wrap">{claim.resolution}</p>
              </CardContent>
            </Card>
          )}

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
                      <Button variant="ghost" size="sm" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/portal/claims/${claim.id}/attachments/${att.id}`, '_blank')}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-slate-400">Status</p>
              <Badge className={statusColors[claim.status]}>{claim.status.replace('_', ' ')}</Badge>
            </div>
            <div>
              <p className="text-slate-400">Priority</p>
              <Badge className={priorityColors[claim.priority]}>{claim.priority}</Badge>
            </div>
            <div>
              <p className="text-slate-400">Assigned To</p>
              <p className="text-slate-200">{claim.assignedTo ? `${claim.assignedTo.firstName} ${claim.assignedTo.lastName}` : 'Pending assignment'}</p>
            </div>
            {claim.resolvedAt && (
              <div>
                <p className="text-slate-400">Resolved</p>
                <p className="text-slate-200">{formatDate(claim.resolvedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


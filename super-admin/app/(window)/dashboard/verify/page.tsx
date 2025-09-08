"use client";
import { useState, useEffect } from 'react';
import { FiFileText, FiUser, FiCheck, FiX, FiLoader, FiDownload, FiChevronDown, FiFilter, FiSearch } from 'react-icons/fi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchVerifications, approveVerification, rejectVerification } from '@/services/api';

interface AdminVerification {
  id: string;
  user: { 
    id: string;
    email: string; 
    school_id: string;
    name?: string;
    phone?: string;
  };
  hostel_name: string;
  hostel_address: string;
  id_documents: string[];
  hostel_proof_documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by_id?: string;
  reviewed_at?: string;
  created_at: string;
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<AdminVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string>('');
  const [rejectModal, setRejectModal] = useState({
    open: false,
    id: '',
    reason: ''
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchVerifications(statusFilter);
      setVerifications(data);
      setFilteredVerifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, [statusFilter]);

  useEffect(() => {
    let result = verifications;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(v => v.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.hostel_name.toLowerCase().includes(query) ||
        v.user.email.toLowerCase().includes(query) ||
        (v.user.name && v.user.name.toLowerCase().includes(query))
      );
    }
    
    setFilteredVerifications(result);
  }, [verifications, statusFilter, searchQuery]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveVerification(id);
      setVerifications(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setProcessingId('');
    }
  };

  const handleReject = async () => {
    setProcessingId(rejectModal.id);
    try {
      await rejectVerification(rejectModal.id, rejectModal.reason);
      setVerifications(prev => prev.filter(v => v.id !== rejectModal.id));
      setRejectModal({ open: false, id: '', reason: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setProcessingId('');
    }
  };

  const getDocumentUrl = (filePath: string, bucket: string) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingState />;
 
  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <Header />
      
      {error && (
        <div className="mb-6">
          <Alert variant="destructive">
            <FiX className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by hostel name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <FiFilter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
<SelectContent>
  <SelectItem value="all">All Statuses</SelectItem>
  <SelectItem value="pending">Pending</SelectItem>
  <SelectItem value="approved">Approved</SelectItem>
  <SelectItem value="rejected">Rejected</SelectItem>
</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredVerifications.length === 0 ? (
        <EmptyState hasFilters={statusFilter !== 'all' || searchQuery !== ''} />
      ) : (
        <div className="space-y-6">
          {filteredVerifications.map((verification) => (
            <VerificationCard
              key={verification.id}
              verification={verification}
              onApprove={handleApprove}
              onReject={(id) => setRejectModal({ open: true, id, reason: '' })}
              getDocumentUrl={getDocumentUrl}
              isProcessing={processingId === verification.id}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      <RejectModal
        isOpen={rejectModal.open}
        reason={rejectModal.reason}
        setReason={(reason) => setRejectModal(prev => ({ ...prev, reason }))}
        onConfirm={handleReject}
        onCancel={() => setRejectModal({ open: false, id: '', reason: '' })}
        isLoading={processingId === rejectModal.id}
      />
    </div>
  );
}

const VerificationCard = ({ 
  verification, 
  onApprove, 
  onReject,
  getDocumentUrl,
  isProcessing,
  formatDate
}: { 
  verification: AdminVerification; 
  onApprove: (id: string) => void; 
  onReject: (id: string) => void;
  getDocumentUrl: (path: string, bucket: string) => string;
  isProcessing: boolean;
  formatDate: (dateString: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden border border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <FiUser className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {verification.hostel_name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {verification.user.email}
                      {verification.user.name && ` • ${verification.user.name}`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(verification.status)}
                  <div className="text-muted-foreground">
                    <FiChevronDown className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </CardHeader>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-0">
          <CardContent className="pt-0">
            <Separator className="mb-6" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">User Details</h4>
                  <div className="space-y-3 pl-2">
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-medium text-muted-foreground">Email:</span>
                      <span className="col-span-2 text-foreground">{verification.user.email}</span>
                    </div>
                    {verification.user.name && (
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium text-muted-foreground">Name:</span>
                        <span className="col-span-2 text-foreground">{verification.user.name}</span>
                      </div>
                    )}
                    {verification.user.phone && (
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium text-muted-foreground">Phone:</span>
                        <span className="col-span-2 text-foreground">{verification.user.phone}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-medium text-muted-foreground">School ID:</span>
                      <span className="col-span-2 text-foreground">{verification.user.school_id}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-medium text-muted-foreground">Submitted:</span>
                      <span className="col-span-2 text-foreground">{formatDate(verification.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">Hostel Details</h4>
                  <div className="space-y-3 pl-2">
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-medium text-muted-foreground">Name:</span>
                      <span className="col-span-2 text-foreground">{verification.hostel_name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-medium text-muted-foreground">Address:</span>
                      <span className="col-span-2 text-foreground">{verification.hostel_address}</span>
                    </div>
                  </div>
                </div>

                {/* Review details for approved/rejected applications */}
                {(verification.status === 'approved' || verification.status === 'rejected') && (
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-3">
                      {verification.status === 'approved' ? 'Approval' : 'Rejection'} Details
                    </h4>
                    <div className="space-y-3 pl-2">
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium text-muted-foreground">Status:</span>
                        <span className="col-span-2 text-foreground capitalize">{verification.status}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium text-muted-foreground">Reviewed at:</span>
                        <span className="col-span-2 text-foreground">
                          {verification.reviewed_at ? formatDate(verification.reviewed_at) : 'N/A'}
                        </span>
                      </div>
                      {verification.rejection_reason && (
                        <div className="grid grid-cols-3 gap-4">
                          <span className="font-medium text-muted-foreground">Reason:</span>
                          <span className="col-span-2 text-foreground">{verification.rejection_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">Documents</h4>
                  <div className="space-y-4 pl-2">
                    <DocumentSection 
                      title="ID Documents" 
                      documents={verification.id_documents} 
                      bucket="id-documents"
                      getDocumentUrl={getDocumentUrl}
                    />
                    <DocumentSection 
                      title="Hostel Proofs" 
                      documents={verification.hostel_proof_documents} 
                      bucket="hostel-proofs"
                      getDocumentUrl={getDocumentUrl}
                    />
                  </div>
                </div>
              </div>
            </div>

            {verification.status === 'pending' && (
              <>
                <Separator className="my-6" />
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => onReject(verification.id)}
                    disabled={isProcessing}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <FiX className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => onApprove(verification.id)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessing ? (
                      <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FiCheck className="mr-2 h-4 w-4" />
                    )}
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const DocumentSection = ({ 
  title, 
  documents, 
  bucket,
  getDocumentUrl
}: { 
  title: string; 
  documents: string[];
  bucket: string;
  getDocumentUrl: (path: string, bucket: string) => string;
}) => (
  <div className="space-y-2">
    <h5 className="font-medium text-foreground">{title}</h5>
    <div className="flex flex-wrap gap-2">
      {documents.map((path, index) => {
        const fileName = path.split('/').pop() || `Document ${index + 1}`;
        const fileUrl = getDocumentUrl(path, bucket);
        
        return (
          <a
            key={index}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiDownload className="mr-1.5 h-3 w-3" />
            {fileName}
          </a>
        );
      })}
    </div>
  </div>
);

const LoadingState = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-4">
      <FiLoader className="animate-spin text-4xl text-muted-foreground mx-auto" />
      <p className="text-muted-foreground">Loading verifications...</p>
    </div>
  </div>
);

const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
  <div className="text-center py-20">
    <div className="space-y-6">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
        <FiFileText className="text-muted-foreground text-3xl" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {hasFilters ? 'No Matching Requests' : 'No Verification Requests'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {hasFilters 
            ? 'No verification requests match your current filters. Try adjusting your search criteria.'
            : 'All verification requests have been processed. New requests will appear here when submitted.'
          }
        </p>
      </div>
    </div>
  </div>
);

const Header = () => (
  <div className="mb-8">
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-foreground">Admin Verifications</h1>
      <p className="text-muted-foreground">Review and manage hostel admin applications</p>
    </div>
  </div>
);

const RejectModal = ({ 
  isOpen, 
  reason, 
  setReason, 
  onConfirm, 
  onCancel, 
  isLoading 
}: {
  isOpen: boolean;
  reason: string;
  setReason: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={() => !isLoading && onCancel()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-foreground">Reason for Rejection</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Please provide a clear reason for rejecting this verification request.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please specify the reason for rejection..."
          className="min-h-[100px] resize-none"
          disabled={isLoading}
        />
      </div>
      
      <DialogFooter className="space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading || !reason.trim()}
          variant="destructive"
        >
          {isLoading && <FiLoader className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Rejection
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
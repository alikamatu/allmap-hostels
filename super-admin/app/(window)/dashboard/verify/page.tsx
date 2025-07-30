"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiUser, FiCheck, FiX, FiLoader, FiDownload } from 'react-icons/fi';
import { fetchPendingVerifications, approveVerification, rejectVerification } from '@/services/api';

interface AdminVerification {
  id: string;
  user: { email: string; school_id: string };
  hostel_name: string;
  hostel_address: string;
  id_documents: string[];
  hostel_proof_documents: string[];
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectModal, setRejectModal] = useState({
    open: false,
    id: '',
    reason: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPendingVerifications();
        setVerifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveVerification(id);
      setVerifications(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  const handleReject = async () => {
    try {
      await rejectVerification(rejectModal.id, rejectModal.reason);
      setVerifications(prev => prev.filter(v => v.id !== rejectModal.id));
      setRejectModal({ open: false, id: '', reason: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed');
    }
  };

const getDocumentUrl = (filePath: string, bucket: string) => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
};

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="flex-1 overflow-auto p-8">
      <Header />
      
      {verifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="max-w-7xl mx-auto">
          <motion.ul className="space-y-4">
            <AnimatePresence>
              {verifications.map((verification, index) => (
                <motion.li
                  key={verification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.05 }
                  }}
                  exit={{ opacity: 0, x: -100 }}
                  layout
                  className="rounded-2xl shadow-md overflow-hidden"
                >
                  <VerificationListItem
                    verification={verification}
                    onApprove={handleApprove}
                    onReject={(id) => setRejectModal({ open: true, id, reason: '' })}
                    getDocumentUrl={getDocumentUrl}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      )}

      <RejectModal
        isOpen={rejectModal.open}
        reason={rejectModal.reason}
        setReason={(reason) => setRejectModal(prev => ({ ...prev, reason }))}
        onConfirm={handleReject}
        onCancel={() => setRejectModal({ open: false, id: '', reason: '' })}
        isLoading={false}
      />
    </div>
  );
}

const VerificationListItem = ({ 
  verification, 
  onApprove, 
  onReject,
  getDocumentUrl
}: { 
  verification: AdminVerification; 
  onApprove: (id: string) => void; 
  onReject: (id: string) => void;
  getDocumentUrl: (path: string, bucket: string) => string;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 rounded-lg"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center">
            <FiUser className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{verification.hostel_name}</h3>
            <p className="">{verification.user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            Pending
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-gray-400"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
              <div>
                <h4 className="text-xl font-semibold mb-3 flex items-center">
                  <FiUser className="mr-2" /> User Details
                </h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {verification.user.email}</p>
                  <p><span className="font-medium">School ID:</span> {verification.user.school_id}</p>
                  <p><span className="font-medium">Hostel Address:</span> {verification.hostel_address}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold mb-3 flex items-center">
                    <FiFileText className="mr-2" /> Documents
                  </h4>
                  <div className="space-y-4">
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

            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onReject(verification.id)}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-lg flex items-center"
              >
                <FiX className="mr-2" /> Reject
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onApprove(verification.id)}
                className="px-6 py-2 bg-green-50 text-green-600 rounded-lg flex items-center"
              >
                <FiCheck className="mr-2" /> Approve
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  <div>
    <h5 className="font-medium mb-2">{title}</h5>
    <div className="flex flex-wrap gap-2">
      {documents.map((path, index) => {
        const fileName = path.split('/').pop() || `Document ${index + 1}`;
        const fileUrl = getDocumentUrl(path, bucket); // Use the URL builder
        
        return (
          <motion.a
            key={index}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
          >
            <FiDownload className="mr-1.5" /> {fileName}
          </motion.a>
        );
      })}
    </div>
  </div>
);

// State components remain the same as previous example
const LoadingState = () => (
  <div className="flex-1 flex items-center justify-center">
    <FiLoader className="animate-spin text-6xl text-gray-600" />
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <div className="text-4xl font-bold text-red-500 mb-4">Error</div>
      <p className="text-2xl text-gray-700">{error}</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20">
    <FiFileText className="mx-auto text-gray-300 text-9xl mb-6" />
    <h2 className="text-4xl font-bold text-gray-700 mb-4">No Pending Requests</h2>
    <p className="text-2xl text-gray-500">All verification requests have been processed</p>
  </div>
);

const Header = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8"
  >
    <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Verifications</h1>
    <p className="text-xl text-gray-600">Review and approve hostel admin applications</p>
  </motion.div>
);

const RejectModal = ({ isOpen, reason, setReason, onConfirm, onCancel, isLoading }: {
  isOpen: boolean;
  reason: string;
  setReason: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="rounded-xl p-6 max-w-md w-full"
        >
          <h3 className="text-2xl font-bold mb-4">Reason for Rejection</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-32 p-3 border border-gray-600 rounded-lg mb-4"
            placeholder="Please specify the reason..."
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading || !reason}
              className={`px-4 py-2 rounded-lg text-white ${
                isLoading || !reason ? 'bg-red-300' : 'bg-red-500'
              }`}
            >
              {isLoading ? <FiLoader className="animate-spin mr-2 inline" /> : null}
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
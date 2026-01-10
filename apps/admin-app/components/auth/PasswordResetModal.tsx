import { motion } from 'framer-motion';
import { FiX, FiCheckCircle, FiMail } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { InputField } from '@/components/ui/InputField';
import { ResetStatus } from '@/types/auth';

interface PasswordResetModalProps {
  isOpen: boolean;
  email: string;
  status: ResetStatus;
  error: string;
  modalRef: React.RefObject<HTMLDivElement | null>;
  onEmailChange: (email: string) => void;
  onResetRequest: (email: string) => void;
  onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  email,
  status,
  error,
  modalRef,
  onEmailChange,
  onResetRequest,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Reset Your Password</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          {status === 'success' ? (
            <div className="text-center py-8">
              <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <p className="text-gray-700 mb-6">
                Password reset email sent! Check your inbox.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#FF6A00] text-white hover:bg-[#E55E00]"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 p-3 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <p className="text-gray-600">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
                
                <InputField
                  label="Email Address"
                  type="email"
                  icon="mail"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="your@email.com"
                />
                
                <button
                  onClick={() => onResetRequest(email)}
                  disabled={status === 'loading'}
                  className={`w-full py-3 px-4 text-white font-medium ${
                    status === 'loading'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#FF6A00] hover:bg-[#E55E00]'
                  }`}
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-3" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Mail, AlertCircle } from 'lucide-react';
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
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >
            {/* Handle bar for mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FF6A00]/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-4.5 h-4.5 text-[#FF6A00]" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <div className="px-5 sm:px-6 pb-6 sm:pb-6 pt-5">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-green-600" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">
                    Check your email
                  </h4>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    We sent a reset link to{' '}
                    <strong className="text-gray-700 font-semibold">{email}</strong>.
                    {' '}It expires in 15 minutes.
                  </p>
                  <button
                    onClick={onClose}
                    className="h-10 px-6 bg-[#FF6A00] hover:bg-[#E55E00] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    Enter your admin account email and we&apos;ll send a secure
                    reset link to your inbox.
                  </p>

                  {error && (
                    <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" strokeWidth={2} />
                      <span>{error}</span>
                    </div>
                  )}

                  <InputField
                    label="Email address"
                    type="email"
                    icon="mail"
                    name="reset-email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />

                  <button
                    onClick={() => onResetRequest(email)}
                    disabled={status === 'loading' || !email.trim()}
                    className={[
                      'w-full h-11 rounded-lg text-sm font-semibold',
                      'flex items-center justify-center gap-2 transition-all mt-1',
                      status === 'loading' || !email.trim()
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#FF6A00] hover:bg-[#E55E00] active:scale-[0.98] text-white',
                    ].join(' ')}
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        Sending reset link…
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

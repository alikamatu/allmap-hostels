"use client";

import { useAuth } from '@repo/shared/context';
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { Mail, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { 
  Button, 
  Heading, 
  Text, 
  Input, 
  Alert, 
  AlertDescription,
  cn 
} from "@repo/ui";
import { useRouter } from "next/navigation";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  initialShowResetForm?: boolean;
}

export const ForgotPasswordModal = ({ 
  isOpen, 
  onClose, 
  initialToken = "", 
  initialShowResetForm = false 
}: ForgotPasswordModalProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState(initialToken);
  const [showResetForm, setShowResetForm] = useState(initialShowResetForm);
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'destructive' | 'idle' }>({
    message: '',
    type: 'idle'
  });

  const { forgotPassword, resetPassword } = useAuth();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleResetRequest = async () => {
    if (!resetEmail) {
      setNotification({ message: 'Please enter your email address', type: 'destructive' });
      return;
    }
    try {
      setResetStatus('loading');
      await forgotPassword(resetEmail);
      setResetStatus('success');
      setNotification({ 
        message: 'Password reset email sent! Check your inbox.', 
        type: 'success' 
      });
      setTimeout(() => {
        setResetStatus('idle');
        onClose();
      }, 3000);
    } catch (err: unknown) {
      setResetStatus('error');
      setNotification({ 
        message: err instanceof Error ? err.message || 'Failed to send reset email' : 'Failed to send reset email', 
        type: 'destructive' 
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!resetToken) {
      setNotification({ message: 'Invalid reset token', type: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotification({ message: 'Passwords do not match', type: 'destructive' });
      return;
    }
    if (passwordStrength < 3) {
      setNotification({ message: 'Password is too weak. Please use a stronger password.', type: 'destructive' });
      return;
    }
    try {
      setResetStatus('loading');
      const result = await resetPassword(resetToken, newPassword);
      if (result.ok) {
        setResetStatus('success');
        setNotification({ 
          message: 'Password reset successfully!', 
          type: 'success' 
        });
        setTimeout(() => {
          onClose();
          router.push('/login');
        }, 3000);
      } else {
        throw new Error('Password reset failed');
      }
    } catch (err: unknown) {
      setResetStatus('error');
      setNotification({ 
        message: err instanceof Error ? err.message || 'Failed to reset password' : 'Failed to reset password', 
        type: 'destructive' 
      });
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!isOpen) return <AnimatePresence />;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <AnimatePresence>
        {notification.type !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
          >
            <Alert 
              variant={notification.type} 
              className={cn(
                "shadow-lg border flex items-center py-3 px-4 gap-2 rounded-xl backdrop-blur-md",
                notification.type === 'success' ? "bg-green-50/95 border-green-200" : "bg-red-50/95 border-red-200"
              )}
            >
              <div className={cn(
                "flex-shrink-0 p-1.5 rounded-full",
                notification.type === 'success' ? "bg-green-100" : "bg-red-100"
              )}>
                {notification.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-700" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-700" />
                )}
              </div>
              <AlertDescription className="text-xs font-semibold text-black leading-snug">
                {notification.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, type: "spring", damping: 25 }}
        className="w-full max-w-sm bg-white p-6 shadow-2xl border border-gray-200 relative"
      >
        <div className="flex justify-between items-center mb-4">
          <Heading variant="h4" className="text-black">
            {showResetForm ? 'Reset Your Password' : 'Forgot Password'}
          </Heading>
          <button 
            onClick={onClose} 
            className="text-black hover:text-gray-700 transition-colors p-1"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {resetStatus === 'success' ? (
          <div className="text-center py-4">
            <div className="flex flex-col items-center justify-center space-y-4 mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <Text className="text-black font-medium">
                {showResetForm ? 'Password reset successfully!' : 'Check your email for the link!'}
              </Text>
            </div>
            <Button
              onClick={onClose}
              className="px-8 h-12 bg-black text-white hover:bg-gray-800 transition-colors font-medium rounded-full"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            {!showResetForm ? (
              <div className="space-y-4">
                <Text variant="sm" className="text-black font-medium">
                  Enter your email to receive a password reset link.
                </Text>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResetEmail(e.target.value)}
                  icon={Mail}
                  className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10"
                  placeholder="your@email.com"
                />
                <Button
                  onClick={handleResetRequest}
                  disabled={resetStatus === 'loading'}
                  className={cn(
                    "w-full h-12 text-white font-medium transition-all relative overflow-hidden bg-black hover:bg-gray-800",
                    resetStatus === 'loading' && "bg-gray-600"
                  )}
                >
                  {resetStatus === 'loading' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    {resetStatus === 'loading' ? (
                      <>
                        <FaSpinner className="animate-spin mr-3 h-4 w-4" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Text variant="sm" className="text-black font-medium">
                  Enter your new password below.
                </Text>
                
                <div className="space-y-4">
                  <Input
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0"
                    placeholder="••••••••"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-black hover:text-gray-700 transition-colors p-1"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Text variant="sm" className="text-black">Strength:</Text>
                      <Text variant="sm" className={cn(
                        "font-medium",
                        passwordStrength < 3 ? 'text-red-500' : 
                        passwordStrength === 3 ? 'text-yellow-500' : 'text-green-500'
                      )}>
                        {passwordStrength < 3 ? 'Weak' : passwordStrength === 3 ? 'Good' : 'Strong'}
                      </Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className={cn(
                          "h-1 rounded-full transition-all duration-300",
                          getPasswordStrengthColor()
                        )}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0"
                    placeholder="••••••••"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-black hover:text-gray-700 transition-colors p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>

                <Button
                  onClick={handlePasswordReset}
                  disabled={resetStatus === 'loading'}
                  className={cn(
                    "w-full h-12 text-white font-medium transition-all relative overflow-hidden bg-black hover:bg-gray-800",
                    resetStatus === 'loading' && "bg-gray-600"
                  )}
                >
                  {resetStatus === 'loading' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    {resetStatus === 'loading' ? (
                      <>
                        <FaSpinner className="animate-spin mr-3 h-4 w-4" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </span>
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

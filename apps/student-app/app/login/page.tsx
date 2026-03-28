"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  Alert, 
  AlertDescription, 
  Card, 
  CardContent, 
  Heading, 
  Text,
  cn
} from "@repo/ui";
import { LoginForm } from '@/_components/auth/LoginForm';
import { SignupForm } from '@/_components/auth/SignupForm';
import { ForgotPasswordModal } from '@/_components/auth/ForgotPasswordModal';
import { BrandLogo, BRAND } from '@/_components/brand';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'destructive' | 'idle' }>({
    message: '',
    type: 'idle'
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup' || tab === 'register') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }

    const token = searchParams.get('resetToken');
    if (token) {
      setResetToken(token);
      setShowResetModal(true);
      setShowResetForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (notification.type !== 'idle') {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: 'idle' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAuthError = (message: string) => {
    if (!message) {
      setNotification({ message: '', type: 'idle' });
      return;
    }
    setNotification({ message, type: 'destructive' });
  };

  const handleSignupSuccess = () => {
    setSignupSuccess(true);
    setNotification({ 
      message: 'Account created successfully! You can now sign in.', 
      type: 'success' 
    });
    // Optional: Switch to login after a delay
    setTimeout(() => {
      setSignupSuccess(false);
      setActiveTab('login');
      router.push('/login');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 font-sans relative overflow-hidden">
      {/* Background patterns could go here */}
      
      <AnimatePresence>
        {notification.type !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <Alert 
              variant={notification.type} 
              className={cn(
                "shadow-xl border flex items-center py-4 px-5 gap-3 rounded-2xl backdrop-blur-xl",
                notification.type === 'success' 
                  ? "bg-green-50/95 border-green-200" 
                  : "bg-red-50/95 border-red-200"
              )}
            >
              <div className={cn(
                "flex-shrink-0 p-2 rounded-full",
                notification.type === 'success' ? "bg-green-100" : "bg-red-100"
              )}>
                {notification.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-700" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-700" />
                )}
              </div>
              <AlertDescription className="text-sm font-semibold text-black leading-snug">
                {notification.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <BrandLogo size={44} showText={false} />
              </div>
              <Heading variant="h2" className="text-black mb-2 font-bold tracking-tight">{BRAND.name}</Heading>
              <Text className="text-black font-medium">Manage your stay with ease</Text>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200 mb-8 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setActiveTab('login')}
                className={cn(
                  "flex-1 py-2.5 text-sm font-bold transition-all duration-300 rounded-lg",
                  activeTab === 'login' 
                    ? "bg-white text-black shadow-sm" 
                    : "text-black hover:bg-gray-200"
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={cn(
                  "flex-1 py-2.5 text-sm font-bold transition-all duration-300 rounded-lg",
                  activeTab === 'signup' 
                    ? "bg-white text-black shadow-sm" 
                    : "text-black hover:bg-gray-200"
                )}
              >
                Create Account
              </button>
            </div>

            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {signupSuccess && activeTab === 'signup' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <Heading variant="h3" className="mb-2">Registration Successful!</Heading>
                    <Text className="text-gray-500 mb-8">Your account has been created. We are redirecting you to the login page.</Text>
                  </motion.div>
                ) : activeTab === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginForm 
                      onForgotPassword={() => setShowResetModal(true)} 
                      onError={handleAuthError} 
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SignupForm 
                      onSuccess={handleSignupSuccess} 
                      onError={handleAuthError} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Text variant="sm" className="text-gray-400">
            {BRAND.copyright}
          </Text>
        </div>
      </motion.div>

      <ForgotPasswordModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)}
        initialToken={resetToken}
        initialShowResetForm={showResetForm}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin h-8 w-8 border-b-2 border-black"></div></div>}>
      <AuthPageContent />
    </Suspense>
  );
}
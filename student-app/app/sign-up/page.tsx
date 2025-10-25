"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PhoneIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('student');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const router = useRouter();
  const { register } = useAuth();

  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (passwordStrength < 3) {
      setError('Password is too weak. Use 8+ characters with uppercase, lowercase, numbers and special characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => {
        form.classList.remove('animate-shake');
      }, 500);
      return;
    }

    try {
      setIsLoading(true);
      await register(fullName, phone, email, password, role, termsAccepted, gender);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => {
        form.classList.remove('animate-shake');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-black mb-2">Create Your Account</h1>
          <p className="text-gray-666 mb-8 text-sm leading-relaxed">
            Join the hostel portal to manage your stay
          </p>

          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="bg-green-50 border border-green-200 p-4 mb-6 flex flex-col items-center justify-center text-green-800 ">
                <CheckCircleIcon className="h-8 w-8 mb-2 text-green-600" />
                <p className="text-center font-semibold">Registration successful!</p>
                <p className="text-center text-sm mt-1">
                  Check your email at <span className="font-semibold">{email}</span> to verify your account.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={() => router.push('/')}
                className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 transition"
              >
                Back to Login
              </motion.button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-50 border border-red-200 p-3 mb-6 flex items-center text-red-800 "
                >
                  <XCircleIcon className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label htmlFor="fullName" className="block text-lg font-medium text-black mb-1">
                  Full Name *
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="h-4 w-4 text-black absolute left-3" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <label htmlFor="gender" className="block text-lg font-medium text-black mb-1">
                  Gender *
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="h-4 w-4 text-black absolute left-3" />
                  <select
                    id="gender"
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition appearance-none"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label htmlFor="phone" className="block text-lg font-medium text-black mb-1">
                  Phone Number *
                </label>
                <div className="relative flex items-center">
                  <PhoneIcon className="h-4 w-4 text-black absolute left-3" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                    placeholder="(123) 456-7890"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label htmlFor="email" className="block text-lg font-medium text-black mb-1">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-black absolute left-3" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <label htmlFor="password" className="block text-lg font-medium text-black mb-1">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <LockClosedIcon className="h-4 w-4 text-black absolute left-3" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-black" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-black" />
                    )}
                  </button>
                </div>
                
                {/* Enhanced Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Password Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength <= 2 ? 'text-red-600' : 
                        passwordStrength <= 3 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {passwordStrength <= 2 ? 'Weak' : 
                         passwordStrength <= 3 ? 'Fair' : 
                         passwordStrength <= 4 ? 'Good' : 
                         'Strong'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength <= 2 ? 'bg-red-500 w-1/4' : 
                          passwordStrength <= 3 ? 'bg-yellow-500 w-1/2' : 
                          passwordStrength <= 4 ? 'bg-blue-500 w-3/4' : 
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        At least 8 characters
                      </div>
                      <div className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Contains a number
                      </div>
                      <div className={`flex items-center ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Upper & lowercase letters
                      </div>
                      <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Special character
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <label htmlFor="confirmPassword" className="block text-lg font-medium text-black mb-1">
                  Confirm Password *
                </label>
                <div className="relative flex items-center">
                  <LockClosedIcon className="h-4 w-4 text-black absolute left-3" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 text-base text-black bg-white border-b outline-none transition ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-500' 
                        : confirmPassword && password === confirmPassword
                        ? 'border-green-500'
                        : 'border-gray-200 focus:border-black'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-black" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-black" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <XCircleIcon className="h-3 w-3 mr-1" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 text-xs text-green-600 flex items-center">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Passwords match
                  </p>
                )}
              </motion.div>

              {/* Terms and Conditions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="flex items-start space-x-3 p-4 bg-gray-50  border border-gray-200"
              >
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                    required
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="terms" className="text-gray-700 font-medium">
                    I accept the Terms and Conditions
                  </label>
                  <p className="text-gray-600 mt-1 text-xs">
                    By creating an account, you agree to our Terms of Service and Privacy Policy. 
                    You must be at least 18 years old to register.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || !termsAccepted}
                  className={`w-full py-3 px-4 font-medium text-white transition ${
                    isLoading || !termsAccepted
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-black hover:bg-gray-800 shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </motion.div>

              <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-black font-medium hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Right Panel - Image with Overlay */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/students.jpg"
          alt="Hostel Community"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/75 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Welcome to Hostel Portal
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white max-w-md text-center"
          >
            Sign up to access exclusive hostels for your educational journey
          </motion.p>
        </div>
      </div>
    </div>
  );
}
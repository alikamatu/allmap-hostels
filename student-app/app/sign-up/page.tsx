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
  PhoneIcon
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
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const validateForm = () => {
    if (!fullName) {
      setError('Please enter your full name');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (passwordStrength < 3) {
      setError('Password is too weak. Use 8+ characters with a number and special character.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
      await register(fullName, phone, email, password, 'student', gender || undefined);
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
              <div className="bg-gray-100 p-3 mb-6 flex items-center justify-center text-black">
                <CheckCircleIcon className="h-8 w-8 mr-2 text-black" />
                Registration successful! Check your email at <br /> <span className="font-semibold">{email}</span> to verify your account.
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
                  className="bg-gray-100 p-3 mb-6 flex items-center text-black"
                >
                  <XCircleIcon className="h-4 w-4 mr-2 text-black" />
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label htmlFor="fullName" className="block text-lg font-medium text-black mb-1">
                  Full Name
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
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <label htmlFor="gender" className="block text-lg font-medium text-black mb-1">
                  Gender 
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
                  </select>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label htmlFor="phone" className="block text-lg font-medium text-black mb-1">
                  Phone Number
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
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label htmlFor="email" className="block text-lg font-medium text-black mb-1">
                  Email Address
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
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <label htmlFor="password" className="block text-lg font-medium text-black mb-1">
                  Password
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
                <div className="mt-2 text-sm text-black">
                  Password Strength: {passwordStrength < 3 ? 'Weak' : passwordStrength === 3 ? 'Good' : 'Strong'}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <label htmlFor="confirmPassword" className="block text-lg font-medium text-black mb-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <LockClosedIcon className="h-4 w-4 text-black absolute left-3" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                    placeholder="••••••••"
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 font-medium text-white transition ${
                    isLoading ? 'bg-gray-999 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                      Creating account...
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </motion.button>
              </motion.div>

              <div className="text-center text-sm text-gray-666">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-black hover:underline"
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
        <div className="absolute inset-0 bg-black/70 z-10" />
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
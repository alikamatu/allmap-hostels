"use client";

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Building2, CheckCircle } from 'lucide-react';
// import hostelHero from '../../assets/hostel-hero.jpg';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const HostelAdminLogin = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Login attempt:', formData);
      // Handle successful login here
    } catch (err) {
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const features = [
    'Student & Room Management',
    'Real-time Occupancy Tracking', 
    'Financial & Billing Control'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Hero Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(/assets/hostel-hero.jpg)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/70"></div>
          
          <div className="relative z-10 flex flex-col justify-center items-center h-full p-16 text-white text-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-12'}`}>
              <Building2 className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Hostel Management
                <br />
                <span className="text-3xl font-normal opacity-90">System</span>
              </h1>
              <p className="text-xl mb-8 opacity-80 max-w-md leading-relaxed">
                Streamline operations, enhance student experience, and manage your hostel efficiently
              </p>
            </div>

            <div className={`space-y-4 transform transition-all duration-1000 ${isVisible ? 'animate-slide-in-left animate-delay-300' : 'opacity-0 -translate-x-12'}`}>
              {features.map((feature, index) => (
                <div 
                  key={feature}
                  className={`flex items-center space-x-3 text-lg transform transition-all duration-700 animate-delay-${(index + 4) * 100} ${isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-12'}`}
                >
                  <CheckCircle className="w-6 h-6 text-accent" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Decorative dots */}
            <div className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2 transition-all duration-1000 ${isVisible ? 'animate-fade-in animate-delay-800' : 'opacity-0'}`}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-8 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
          </div>

          {/* Form Header */}
          <div className={`mb-8 transform transition-all duration-1000 ${isVisible ? 'animate-slide-in-up' : 'opacity-0 translate-y-12'}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Sign In
            </h2>
            <p className="text-gray-600">
              Access your management dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`transform transition-all duration-700 ${isVisible ? 'animate-slide-in-up animate-delay-100' : 'opacity-0 translate-y-12'}`}>
              <Label htmlFor="email" className="text-gray-800 font-medium mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className={`h-12 text-gray-900 bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 animate-fade-in">
                  {errors.email}
                </p>
              )}
            </div>

            <div className={`transform transition-all duration-700 ${isVisible ? 'animate-slide-in-up animate-delay-200' : 'opacity-0 translate-y-12'}`}>
              <Label htmlFor="password" className="text-gray-800 font-medium mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`h-12 pr-12 text-gray-900 bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 animate-fade-in">
                  {errors.password}
                </p>
              )}
            </div>

            <div className={`flex items-center justify-between transform transition-all duration-700 ${isVisible ? 'animate-slide-in-up animate-delay-300' : 'opacity-0 translate-y-12'}`}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange('rememberMe')}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20 focus:ring-1"
                  disabled={isLoading}
                />
                <span className="text-gray-700 text-sm">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center animate-fade-in">
                {errors.submit}
              </div>
            )}

            <div className={`transform transition-all duration-700 ${isVisible ? 'animate-slide-in-up animate-delay-400' : 'opacity-0 translate-y-12'}`}>
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>

            <div className={`text-center transform transition-all duration-700 ${isVisible ? 'animate-slide-in-up animate-delay-500' : 'opacity-0 translate-y-12'}`}>
              <p className="text-gray-600 text-sm">
                Need assistance?{' '}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                  disabled={isLoading}
                >
                  Contact Support
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HostelAdminLogin;
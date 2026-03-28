"use client";

import { useAuth } from '@repo/shared/context';
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { 
  Button, 
  Input, 
  cn 
} from "@repo/ui";
import { loginSchema } from "./auth-schemas";

interface LoginFormProps {
  onForgotPassword: () => void;
  onError: (message: string) => void;
}

export const LoginForm = ({ onForgotPassword, onError }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");

    // Zod validation
    const result = loginSchema.safeParse({ email, password, rememberMe });
    if (!result.success) {
      onError(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      await login(email, password, rememberMe);
    } catch (err: unknown) {
      let errorMessage = 'Login failed. Please try again.';
      if (err instanceof Error && err.message.includes('credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (err instanceof Error && err.message.includes('verified')) {
        errorMessage = 'Please verify your email first';
      } else if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      onError(errorMessage);
      
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => {
        form.classList.remove('animate-shake');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-1"
      >
        <Input
          id="email"
          type="email"
          label="Email"
          icon={Mail}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-12"
          placeholder="your@email.com"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-1"
      >
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          icon={Lock}
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-12"
          placeholder="••••••••"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-black hover:text-gray-700 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
      </motion.div>

      <div className="flex justify-between items-center text-sm">
        <button
          type="button"
          onClick={() => setRememberMe(!rememberMe)}
          className="flex items-center space-x-2 text-black font-medium transition-colors group"
        >
          <div className={`w-4 h-4 border border-black flex items-center justify-center ${rememberMe ? 'bg-black border-black' : ''}`}>
            {rememberMe && <FiCheckCircle className="h-3 w-3 text-white" />}
          </div>
          <span>Remember me</span>
        </button>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-black font-medium hover:underline transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-14 text-white font-medium transition-all duration-300 relative overflow-hidden bg-black hover:bg-gray-800",
            loading && "bg-gray-700"
          )}
        >
          {loading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"
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
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-3 h-4 w-4" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
        </Button>
      </motion.div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 font-medium tracking-wider">Or continue with</span>
        </div>
      </div>

      {/* Google Login Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-14 border border-gray-200 bg-white hover:bg-gray-50 text-black font-bold transition-all duration-300 rounded-xl flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
        >
          <FcGoogle className="h-6 w-6" />
          <span>Continue with Google</span>
        </Button>
      </motion.div>
    </form>
  );
};

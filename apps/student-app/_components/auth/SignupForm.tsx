"use client";

import { useState, useEffect } from "react";
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { 
  Button, 
  Input, 
  cn,
  Alert,
  AlertDescription 
} from "@repo/ui";
import { signupSchema } from "./auth-schemas";

interface SignupFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const SignupForm = ({ onSuccess, onError }: SignupFormProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"" | "male" | "female">("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");

    const result = signupSchema.safeParse({
      fullName,
      email,
      phone,
      gender,
      password,
      confirmPassword,
      termsAccepted,
    });

    if (!result.success) {
      onError(result.error.issues[0].message);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fullName,
            phone,
            email,
            password_hash: password,
            role: "student",
            gender,
            terms_accepted: termsAccepted,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      onSuccess();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="fullName"
          label="Full Name"
          icon={User}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11"
          placeholder="John Doe"
          required
        />
        
        <div>
          <label className="text-xs font-medium text-black mb-1 block">Gender *</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            className="w-full h-11 bg-white border-b border-gray-200 focus:border-black outline-none transition px-0 text-sm"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="email"
          type="email"
          label="Email Address"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11"
          placeholder="your@email.com"
          required
        />

        <Input
          id="phone"
          type="tel"
          label="Phone Number"
          icon={Phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11"
          placeholder="+233 XX XXX XXXX"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11"
            placeholder="••••••••"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-black hover:text-gray-700 p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          {password && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 bg-gray-200 rounded-full">
                <div 
                  className={cn("h-1 rounded-full transition-all duration-300", getPasswordStrengthColor())} 
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-500 uppercase">
                {passwordStrength < 3 ? 'Weak' : passwordStrength === 3 ? 'Fair' : 'Strong'}
              </span>
            </div>
          )}
        </div>

        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11"
          placeholder="••••••••"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-black hover:text-gray-700 p-1"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
      </div>

      <div className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <input
          id="terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
          required
        />
        <label htmlFor="terms" className="text-xs font-medium text-black leading-tight">
          I accept the <strong>Terms and Conditions</strong> and privacy policy. I am at least 18 years old.
        </label>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !termsAccepted}
        className={cn(
          "w-full h-14 text-white font-medium transition-all duration-300 relative overflow-hidden bg-black hover:bg-gray-800",
          (isLoading || !termsAccepted) && "bg-gray-400 opacity-70"
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-3 h-4 w-4" />
            <span>Creating account...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span>Create Account</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        )}
      </Button>
    </form>
  );
};

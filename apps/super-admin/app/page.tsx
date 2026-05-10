"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiTerminal, FiAlertCircle, FiShield } from 'react-icons/fi';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const LoginPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [terminalText, setTerminalText] = useState<string[]>([]);
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    const bootSequence = [
      "INITIALIZING SYSTEM...",
      "LOADING SECURITY PROTOCOLS...",
      "SCANNING BIOMETRICS...",
      "DECRYPTING AUTHENTICATION MODULE...",
      "ESTABLISHING SECURE CONNECTION...",
      "SYSTEM STATUS: ONLINE",
      "WELCOME, MASTER ADMIN"
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setTerminalText(prev => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setSystemReady(true);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await login(email, password, rememberMe);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CRITICAL AUTHENTICATION FAILURE');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced Matrix Rain with varying speeds and characters
  const MatrixRain = () => {
    return (
      <div className="absolute inset-0 overflow-hidden opacity-[0.15] z-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-500 text-sm font-mono whitespace-nowrap"
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: '110vh', 
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            style={{
              left: `${(i / 30) * 100}%`,
              writingMode: 'vertical-rl',
              textOrientation: 'upright'
            }}
          >
            {Array.from({ length: 20 }).map(() => 
              String.fromCharCode(0x30A0 + Math.random() * 96)
            ).join('')}
          </motion.div>
        ))}
      </div>
    );
  };

  const TerminalOutput = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 left-6 w-96 hidden lg:block z-50"
    >
      <div className="bg-black/90 border border-green-500/30 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.1)] overflow-hidden">
        <div className="bg-green-950/20 px-3 py-2 border-b border-green-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiTerminal className="text-green-500 size-3" />
            <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">Security Terminal</span>
          </div>
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full bg-red-500/50" />
            <div className="size-2 rounded-full bg-yellow-500/50" />
            <div className="size-2 rounded-full bg-green-500/50" />
          </div>
        </div>
        <div className="p-4 font-mono text-[11px] h-48 overflow-y-auto scrollbar-hide text-green-400/80 space-y-1">
          {terminalText.map((line, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-green-600 opacity-50">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className="text-green-500">{" >>> "}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {line}
              </motion.span>
            </div>
          ))}
          <div className="animate-pulse inline-block w-2 h-3 bg-green-500 ml-1 translate-y-0.5" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] overflow-hidden relative selection:bg-green-500/30 selection:text-green-200">
      <MatrixRain />
      <TerminalOutput />
      
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-30 w-full max-w-md px-6"
      >
        <Card className="bg-black/60 backdrop-blur-xl border-green-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
          {/* Animated border line */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="size-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center relative group"
              >
                <div className="absolute inset-0 bg-green-500/20 blur-xl group-hover:blur-2xl transition-all rounded-full opacity-50" />
                <FiShield className="text-green-500 text-3xl relative z-10" />
              </motion.div>
            </div>
            
            <div className="text-center space-y-1.5">
              <CardTitle className="text-2xl font-mono tracking-tighter text-white uppercase flex items-center justify-center gap-3">
                <span className="text-green-500">::</span> 
                Access Point
                <span className="text-green-500">::</span>
              </CardTitle>
              <CardDescription className="font-mono text-green-700 text-[11px] uppercase tracking-widest">
                Protocol Override Required
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-green-600 ml-1">
                    Identification_ID
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <FiMail className="text-green-700 group-focus-within:text-green-400 transition-colors" />
                    </div>
                    <Input
                      type="email"
                      placeholder="admin@nexus.sys"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-black/40 border-green-900/50 focus-visible:ring-green-500/50 focus-visible:border-green-500/50 text-green-100 pl-10 h-12 font-mono text-sm placeholder:text-green-900 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-green-600 ml-1">
                    Security_Cipher
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <FiLock className="text-green-700 group-focus-within:text-green-400 transition-colors" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-black/40 border-green-900/50 focus-visible:ring-green-500/50 focus-visible:border-green-500/50 text-green-100 pl-10 pr-10 h-12 font-mono text-sm placeholder:text-green-900 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-green-900 hover:text-green-400 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-3.5 rounded border-green-900 bg-black/40 text-green-600 focus:ring-green-500 focus:ring-offset-black"
                  />
                  <label htmlFor="remember" className="text-[10px] font-mono text-green-700 uppercase cursor-pointer hover:text-green-500 transition-colors">
                    Stay_Connected
                  </label>
                </div>
                <button type="button" className="text-[10px] font-mono text-green-700 uppercase hover:text-green-400 transition-colors">
                  Lost_Key?
                </button>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Alert variant="destructive" className="bg-red-950/20 border-red-500/20 text-red-400 font-mono text-[11px] py-3">
                      <FiAlertCircle className="size-4" />
                      <AlertTitle className="uppercase tracking-widest mb-1 text-[10px]">Security Alert</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={isLoading || !systemReady}
                className={cn(
                  "w-full h-12 font-mono uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group",
                  systemReady 
                    ? "bg-green-600 hover:bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                    : "bg-green-950/50 text-green-800 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Bypassing...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Initialize Session</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
            <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] flex-1 bg-green-500/10" />
              <span className="text-[9px] font-mono text-green-900 uppercase">Authorization Required</span>
              <div className="h-[1px] flex-1 bg-green-500/10" />
            </div>
            
            <p className="text-[10px] font-mono text-green-700 uppercase">
              Unauthorized Access? 
              <button className="ml-2 text-green-500 hover:text-green-300 transition-colors">Request_Node</button>
            </p>
          </CardFooter>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-green-500/30" />
          <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-green-500/30" />
          <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-green-500/30" />
          <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-green-500/30" />
        </Card>
      </motion.div>

      {/* Audio visualization effect (fake) */}
      <div className="fixed bottom-10 right-10 flex items-end gap-1 h-12 opacity-20 hidden md:flex">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-green-500"
            animate={{ height: [4, 20, 8, 30, 4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .glitch-text:hover {
          animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
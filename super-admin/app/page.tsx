"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiTerminal } from 'react-icons/fi';

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

  useEffect(() => {
    // Simulate terminal boot-up sequence
    const bootSequence = [
      "INITIALIZING SYSTEM...",
      "LOADING SECURITY PROTOCOLS...",
      "AUTHENTICATION MODULE READY",
      "ACCESS GRANTED: LEVEL 0 SECURITY",
      "WELCOME, ADMIN"
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setTerminalText(prev => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 300);

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
      setError(err instanceof Error ? err.message : 'AUTHENTICATION FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  // Matrix-like code rain effect in background
  const MatrixRain = () => {
    return (
      <div className="absolute inset-0 overflow-hidden opacity-20 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 text-xs font-mono"
            initial={{ y: -20, opacity: 0 }}
            animate={{ 
              y: '100vh', 
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          >
            {Math.random().toString(36).substring(2, 3)}
          </motion.div>
        ))}
      </div>
    );
  };

  // Hacker-style terminal output
  const TerminalOutput = () => (
    <div className="absolute top-4 left-4 w-80 h-40 bg-black/80 border border-green-500/50 rounded-md p-3 font-mono text-xs text-green-400 overflow-hidden z-10">
      <div className="flex items-center mb-2">
        <FiTerminal className="text-green-500 mr-2" />
        <span className="text-green-500">SYSTEM TERMINAL</span>
        <div className="ml-2 flex">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
      <div className="overflow-y-auto h-28">
        {terminalText.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-1"
          >
            <span className="text-green-500">$ </span>
            {line}
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative">
      <MatrixRain />
      <TerminalOutput />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 pointer-events-none z-10"></div>
      <div className="absolute inset-0 pointer-events-none z-20 scanlines"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-30 w-full max-w-md px-6"
      >
        <div className="bg-black/90 backdrop-blur-md rounded-md shadow-xl p-8 border border-green-500/30 glitch-effect">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto bg-gradient-to-r from-green-600 to-green-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 glitch-box"
            >
              <FiUser className="text-white text-2xl" />
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold text-green-400 glitch-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              data-text="ACCESS CONTROL"
            >
              ACCESS CONTROL
            </motion.h1>
            <motion.p 
              className="text-green-600 mt-2 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              IDENTIFY YOURSELF
            </motion.p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-green-500 mb-1 font-mono">
                  USER_ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-green-600" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-black/50 border border-green-700/50 rounded-md text-green-400 placeholder-green-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all font-mono"
                    placeholder="admin@domain.com"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-green-500 mb-1 font-mono">
                  ENCRYPTION_KEY
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-green-600" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-black/50 border border-green-700/50 rounded-md text-green-400 placeholder-green-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all font-mono"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-green-600 hover:text-green-400 transition-colors" />
                    ) : (
                      <FiEye className="text-green-600 hover:text-green-400 transition-colors" />
                    )}
                  </button>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-green-600 rounded focus:ring-green-500 border-green-700 bg-black/50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-green-500 font-mono">
                    PERSIST_SESSION
                  </label>
                </div>

                <div className="text-sm">
                  <a 
                    href="/forgot-password" 
                    className="font-mono text-green-600 hover:text-green-400 transition-colors"
                  >
                    KEY_RECOVERY
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-md font-mono font-medium text-white transition-all ${
                    isLoading 
                      ? 'bg-green-800/50 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 shadow-lg hover:shadow-green-500/10 border border-green-600/50'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AUTHENTICATING...
                    </span>
                  ) : (
                    'EXECUTE_LOGIN'
                  )}
                </button>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-400 text-sm p-3 bg-red-900/30 rounded-md border border-red-800 font-mono"
                >
                  <span className="text-red-500">ERROR: </span>
                  {error}
                </motion.div>
              )}
            </div>
          </form>

          <motion.div
            className="mt-8 text-center text-green-700 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p>
              NO CREDENTIALS?{' '}
              <a 
                href="/register" 
                className="font-medium text-green-600 hover:text-green-400 transition-colors"
              >
                REQUEST_ACCESS
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        
        .scanlines {
          position: relative;
          overflow: hidden;
        }
        
        .scanlines:before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 0%,
            rgba(0, 255, 0, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          z-index: 20;
          animation: scanline 8s linear infinite;
          pointer-events: none;
        }
        
        .glitch-effect {
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.2),
                      0 0 20px rgba(0, 255, 0, 0.1),
                      0 0 30px rgba(0, 255, 0, 0.05);
        }
        
        .glitch-box {
          position: relative;
        }
        
        .glitch-box:before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, #00ff00, #000000, #000000, #00ff00);
          background-size: 400%;
          border-radius: 50%;
          animation: glowing 3s ease infinite;
          opacity: 0.7;
        }
        
        .glitch-text {
          position: relative;
          display: inline-block;
        }
        
        .glitch-text:before,
        .glitch-text:after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text:before {
          left: 2px;
          text-shadow: -2px 0 #ff00ff;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        
        .glitch-text:after {
          left: -2px;
          text-shadow: -2px 0 #00ffff;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-anim {
          0% { clip: rect(42px, 9999px, 44px, 0); }
          5% { clip: rect(12px, 9999px, 59px, 0); }
          10% { clip: rect(48px, 9999px, 29px, 0); }
          15% { clip: rect(42px, 9999px, 73px, 0); }
          20% { clip: rect(63px, 9999px, 27px, 0); }
          25% { clip: rect(34px, 9999px, 55px, 0); }
          30% { clip: rect(86px, 9999px, 73px, 0); }
          35% { clip: rect(20px, 9999px, 20px, 0); }
          40% { clip: rect(26px, 9999px, 60px, 0); }
          45% { clip: rect(25px, 9999px, 66px, 0); }
          50% { clip: rect(57px, 9999px, 98px, 0); }
          55% { clip: rect(5px, 9999px, 46px, 0); }
          60% { clip: rect(82px, 9999px, 31px, 0); }
          65% { clip: rect(54px, 9999px, 27px, 0); }
          70% { clip: rect(28px, 9999px, 99px, 0); }
          75% { clip: rect(45px, 9999px, 69px, 0); }
          80% { clip: rect(23px, 9999px, 85px, 0); }
          85% { clip: rect(54px, 9999px, 84px, 0); }
          90% { clip: rect(45px, 9999px, 47px, 0); }
          95% { clip: rect(24px, 9999px, 23px, 0); }
          100% { clip: rect(32px, 9999px, 92px, 0); }
        }
        
        @keyframes glitch-anim2 {
          0% { clip: rect(65px, 9999px, 100px, 0); }
          5% { clip: rect(52px, 9999px, 74px, 0); }
          10% { clip: rect(79px, 9999px, 85px, 0); }
          15% { clip: rect(75px, 9999px, 5px, 0); }
          20% { clip: rect(67px, 9999px, 61px, 0); }
          25% { clip: rect(14px, 9999px, 79px, 0); }
          30% { clip: rect(1px, 9999px, 66px, 0); }
          35% { clip: rect(86px, 9999px, 30px, 0); }
          40% { clip: rect(23px, 9999px, 98px, 0); }
          45% { clip: rect(85px, 9999px, 72px, 0); }
          50% { clip: rect(71px, 9999px, 75px, 0); }
          55% { clip: rect(2px, 9999px, 48px, 0); }
          60% { clip: rect(30px, 9999px, 16px, 0); }
          65% { clip: rect(59px, 9999px, 50px, 0); }
          70% { clip: rect(41px, 9999px, 62px, 0); }
          75% { clip: rect(2px, 9999px, 82px, 0); }
          80% { clip: rect(47px, 9999px, 73px, 0); }
          85% { clip: rect(3px, 9999px, 27px, 0); }
          90% { clip: rect(26px, 9999px, 55px, 0); }
          95% { clip: rect(42px, 9999px, 97px, 0); }
          100% { clip: rect(38px, 9999px, 49px, 0); }
        }
        
        @keyframes glowing {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
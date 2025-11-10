'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX, FiSettings, FiCalendar, FiHelpCircle, FiSun, FiMoon, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { DepositModal } from "./payment/DepositModal";
import { useDepositBalance } from '@/hooks/useDepositBalance';
import { depositService } from "@/service/depositService";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { balance, loading, error, refreshBalance } = useDepositBalance();
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleDepositSuccess = () => {
    refreshBalance();
  };

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/help", label: "Help" },
  ];

  const formatBalance = (amount: number) => {
    return depositService.formatPrice(amount);
  };

  return (
    <>
      <header className="fixed w-full z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Allmap Hostels Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-black">
                Allmap<span className="font-light">Hostels</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-black hover:bg-gray-100 transition rounded-lg"
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Deposit Balance */}
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="px-4 py-2 bg-black transition-all flex items-center space-x-2 text-white"
                    title="Click to add funds to your account"
                  >
                    <span className="flex items-center">
                      {loading ? (
                        <span className="flex items-center">
                          Loading...
                        </span>
                      ) : error ? (
                        'Error'
                      ) : (
                        formatBalance(balance?.availableBalance || 0)
                      )}
                    </span>
                  </button>

                  <div className="relative group">
                    <button className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-medium">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="text-black font-medium">{user.name || "User"}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-200">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-black hover:bg-gray-100 transition"
                      >
                        <FiUser className="mr-2" /> Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center px-4 py-2 text-black hover:bg-gray-100 transition"
                      >
                        <FiLogOut className="mr-2" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    className="px-4 py-2 text-black hover:bg-gray-100 transition rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-black hover:bg-gray-100 rounded-lg transition"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white min-h-screen absolute top-full left-0 right-0 shadow-lg"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="flex items-center px-4 py-3 text-black hover:bg-gray-100 rounded-lg transition"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label === "Home" && <FiHome className="mr-3" />}
                        {link.label === "Bookings" && <FiCalendar className="mr-3" />}
                        {link.label === "Help" && <FiHelpCircle className="mr-3" />}
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <hr className="my-4 border-t border-gray-200" />

                {user ? (
                  <div className="space-y-1">
                    {/* Deposit Balance for Mobile */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (navLinks.length) * 0.1 }}
                    >
                      <button
                        onClick={() => {
                          setShowDepositModal(true);
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 bg-black text-white transition-all"
                      >
                        <FiDollarSign className="mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Account Balance</div>
                          <div className="text-sm opacity-90">
                            {loading ? 'Loading...' : error ? 'Error' : formatBalance(balance?.availableBalance || 0)}
                          </div>
                        </div>
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (navLinks.length + 1) * 0.1 }}
                    >
                      <div className="flex items-center px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-medium mr-3">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="text-black font-medium">{user.name || "User"}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (navLinks.length + 2) * 0.1 }}
                    >
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center px-4 py-3 text-black hover:bg-gray-100 rounded-lg transition"
                        onClick={() => setIsOpen(false)}
                      >
                        <FiUser className="mr-3" /> Profile
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (navLinks.length + 3) * 0.1 }}
                    >
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-100 rounded-lg transition text-left"
                      >
                        <FiLogOut className="mr-3" /> Logout
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (navLinks.length + 1) * 0.1 }}
                    >
                      <Link
                        href="/"
                        className="flex items-center px-4 py-3 text-black hover:bg-gray-100 rounded-lg transition"
                        onClick={() => setIsOpen(false)}
                      >
                        <FiLogIn className="mr-3" /> Login
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (navLinks.length + 2) * 0.1 }}
                    >
                      <Link
                        href="/sign-up"
                        className="flex items-center px-4 py-3 bg-black text-white hover:bg-gray-800 rounded-lg transition"
                        onClick={() => setIsOpen(false)}
                      >
                        <FiUserPlus className="mr-3" /> Sign Up
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Deposit Modal */}
      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDepositSuccess={handleDepositSuccess}
      />
    </>
  );
}
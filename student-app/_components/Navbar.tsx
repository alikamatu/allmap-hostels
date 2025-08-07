"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX, FiSettings, FiCalendar, FiBell, FiHelpCircle } from "react-icons/fi";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const navLinks = [
    { href: "/", label: "Home", icon: <FiHome className="mr-2" /> },
    { href: "/bookings", label: "Bookings", icon: <FiCalendar className="mr-2" /> },
    { href: "/settings", label: "Settings", icon: <FiSettings className="mr-2" /> },
    { href: "/help", label: "Help", icon: <FiHelpCircle className="mr-2" /> },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-gradient-to-r from-blue-600 to-indigo-700 py-4"}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded"></div>
            </div>
            <span className={`text-xl font-bold ${isScrolled ? "text-blue-600" : "text-white"}`}>
              Hostel<span className="font-light">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all flex items-center ${
                  isScrolled
                    ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center ml-4 space-x-3">
                <div className="relative">
                  <button className="p-2 rounded-full hover:bg-white/10">
                    <FiBell className={`text-xl ${isScrolled ? "text-gray-700" : "text-white"}`} />
                  </button>
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                  <div className="relative group">
                    <button className="flex items-center">
                      <span className={`font-medium ${isScrolled ? "text-gray-800" : "text-white"}`}>
                        {user.name || "User"}
                      </span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FiUser className="mr-2" /> Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FiLogOut className="mr-2" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center ml-4 space-x-2">
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    isScrolled
                      ? "text-blue-600 hover:bg-blue-50"
                      : "text-white border border-white/50 hover:bg-white/10"
                  }`}
                >
                  <FiLogIn className="mr-2" /> Login
                </Link>
                <Link
                  href="/sign-up"
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    isScrolled
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <FiUserPlus className="mr-2" /> Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 rounded-lg ${
              isScrolled ? "bg-blue-50 text-blue-600" : "bg-white/10 text-white"
            }`}
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-xl absolute top-full left-0 right-0 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium mr-3">
                        {user.name ? user.name.charAt(0) : "U"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name || "User"}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiUser className="mr-2" /> My Profile
                    </Link>

                    <div className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                      <FiBell className="mr-2" />
                      Notifications
                      {notificationCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      className="flex items-center justify-center px-4 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiLogIn className="mr-2" /> Login
                    </Link>
                    <Link
                      href="/sign-up"
                      className="flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiUserPlus className="mr-2" /> Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
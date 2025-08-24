'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX, FiSettings, FiCalendar, FiBell, FiHelpCircle, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "@/context/ThemeProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount] = useState(3);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/help", label: "Help" },
  ];

  return (
    <header className="fixed w-full z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <div className="w-4 h-4 bg-white"></div>
            </div>
            <span className="text-xl font-bold text-black">
              Hostel<span className="font-light">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-black hover:bg-gray-100 transition"
              >
                {link.label}
              </Link>
            ))}

            {mounted && (
              <button
                onClick={toggleTheme}
                className="px-4 py-2 text-black hover:bg-gray-100 transition flex items-center"
              >
                {theme === "light" ? <FiMoon className="mr-2" /> : <FiSun className="mr-2" />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button className="p-2">
                    <FiBell className="text-black text-xl" />
                  </button>
                  {notificationCount > 0 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-0 right-0 bg-gray-200 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {notificationCount}
                    </motion.span>
                  )}
                </div>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-medium">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                    <span className="text-black font-medium">{user.name || "User"}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-black hover:bg-gray-100"
                    >
                      <FiUser className="mr-2" /> Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center px-4 py-2 text-black hover:bg-gray-100"
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
                  className="px-4 py-2 text-black hover:underline"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 text-black hover:underline"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-black"
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
            className="md:hidden bg-white absolute top-full left-0 right-0"
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
                      className="flex items-center px-4 py-3 text-black hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label === "Home" && <FiHome className="mr-2" />}
                      {link.label === "Bookings" && <FiCalendar className="mr-2" />}
                      {link.label === "Settings" && <FiSettings className="mr-2" />}
                      {link.label === "Help" && <FiHelpCircle className="mr-2" />}
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <hr className="my-4 border-t border-gray-200" />

              {mounted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: navLinks.length * 0.1 }}
                >
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-100"
                  >
                    {theme === "light" ? <FiMoon className="mr-2" /> : <FiSun className="mr-2" />}
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </button>
                </motion.div>
              )}

              {user ? (
                <div className="space-y-1">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (navLinks.length + 1) * 0.1 }}
                  >
                    <div className="flex items-center px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-medium mr-3">
                        {user.name ? user.name.charAt(0) : "U"}
                      </div>
                      <div className="text-black font-medium">{user.name || "User"}</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (navLinks.length + 2) * 0.1 }}
                  >
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-3 text-black hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiUser className="mr-2" /> Profile
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (navLinks.length + 3) * 0.1 }}
                  >
                    <div className="flex items-center px-4 py-3 text-black hover:bg-gray-100">
                      <FiBell className="mr-2" />
                      Notifications
                      {notificationCount > 0 && (
                        <span className="ml-auto bg-gray-200 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (navLinks.length + 4) * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-2" /> Logout
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
                      className="flex items-center px-4 py-3 text-black hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiLogIn className="mr-2" /> Login
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (navLinks.length + 2) * 0.1 }}
                  >
                    <Link
                      href="/sign-up"
                      className="flex items-center px-4 py-3 text-black hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiUserPlus className="mr-2" /> Sign Up
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
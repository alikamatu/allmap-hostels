"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMenu, FiBriefcase, FiArchive, FiHome, FiMail, FiUser, FiUserCheck } from 'react-icons/fi';
import Link from 'next/link';

const SidebarItem = ({ icon, text, isOpen, isActive, href }: { 
  icon: React.ReactNode; 
  text: string; 
  isOpen: boolean; 
  isActive: boolean; 
  href: string; 
}) => (
  <Link href={href} passHref>
    <motion.span
      whileHover={{ scale: 1.03 }}
      className={`p-5 cursor-pointer rounded-xl flex items-center ${
        isActive 
          ? 'bg-black text-white' 
          : 'hover:bg-gray-100'
      }`}
    >
      <div className="text-3xl">{icon}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="ml-4 text-4xl font-bold"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  </Link>
);

export const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Work');

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { id: 'Work', icon: <FiBriefcase />, href: '/work' },
    { id: 'Verify', icon: <FiUserCheck />, href: '/dashboard/verify' },
    { id: 'About', icon: <FiUser />, href: '/about' },
    { id: 'Agency', icon: <FiHome />, href: '/agency' },
    { id: 'Contact', icon: <FiMail />, href: '/contact' },
  ];

  return (
    <motion.div
      initial={{ width: 100 }}
      animate={{ width: isOpen ? 400 : 100 }}
      transition={{ type: 'spring', damping: 20 }}
      className="h-screen bg-white border-l border-gray-200 flex flex-col order-last"
    >
      <div className="p-6 flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`font-bold ${isOpen ? 'text-6xl' : 'text-4xl'}`}
        >
          {isOpen ? 'ALLMAP' : 'AM'}
        </motion.h1>
        
        <motion.button
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </motion.button>
      </div>

      <div className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            text={item.id}
            isOpen={isOpen}
            isActive={activeItem === item.id}
            href={item.href}
          />
        ))}
      </div>

      <motion.div 
        className="p-6 text-center text-gray-500"
        animate={{ opacity: isOpen ? 1 : 0 }}
      >
        © {new Date().getFullYear()} TED
      </motion.div>
    </motion.div>
  );
};
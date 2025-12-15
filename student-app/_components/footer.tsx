'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiMail, FiExternalLink } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FiGithub />, href: 'https://github.com', label: 'GitHub' },
    { icon: <FiTwitter />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <FiMail />, href: 'mailto:hello@allmaphostels.com', label: 'Email' },
  ];

  const footerLinks = [
    { text: 'Privacy Policy', href: '/privacy' },
    // { text: 'Terms of Service', href: '/terms' },
    // { text: 'Support', href: '/support' },
    // { text: 'API Documentation', href: '/docs', icon: <FiExternalLink className="inline ml-1" /> },
  ];

  return (
    <footer className="bg-white mt-24">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          {/* <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AH</span>
                </div>
                <span className="text-xl font-bold tracking-tight">AllMapHostels</span>
              </div>
            </Link>
            <p className="text-gray-600 text-sm max-w-md leading-relaxed">
              A platform connecting students with verified hostels near educational institutions.
              Currently in active development.
            </p>
          </div> */}

          {/* <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Connect</h3>
            <div className="flex gap-3">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all duration-200"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  aria-label={link.label}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div> */}
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8" />

        {/* Middle Section - Quick Links */}
        <div className="flex flex-wrap gap-6 mb-10">
          {footerLinks.map((link) => (
            <Link
              key={link.text}
              href={link.href}
              className="group inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors"
            >
              <span className="relative">
                {link.text}
                {/* {link.icon} */}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-300" />
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Disclaimers */}
          <div className="space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              AllMap Hostels is under active development. Listings, availability, and prices may change.
            </p>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              © {currentYear} AllMapHostels. All rights reserved.
            </p>
            
            {/* Version/Build Info */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 font-mono px-2 py-1 bg-gray-50 rounded">
                v1.0.0-alpha
              </span>
              <span className="text-xs text-gray-400">
                Made with ♡ for students
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Background Pattern */}
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent rounded-full blur-3xl" />
      </div>
    </footer>
  );
}
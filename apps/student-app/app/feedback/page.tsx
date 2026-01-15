"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'Twitter',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    url: 'https://twitter.com'
  },
  {
    name: 'LinkedIn',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    url: 'https://linkedin.com'
  },
  {
    name: 'GitHub',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    url: 'https://github.com'
  },
  {
    name: 'Email',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    url: 'mailto:support@hostelmanagement.com'
  }
];

export default function PublicContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/feedback/public`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Get in Touch</h1>
          <p className="text-gray-600">
            Have questions, suggestions, or need support? We are here to help.
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
                  required
                  maxLength={255}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">What is this about?</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
                required
              >
                <option value="general">General Inquiry</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="feedback">Feedback</option>
                <option value="support">Support Request</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of your message"
                className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
                required
                maxLength={150}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please provide detailed information about your inquiry..."
                rows={6}
                className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none resize-none"
                required
                minLength={10}
                maxLength={2000}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.message.length}/2000
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>

            {/* Messages */}
            {success && (
              <div className="text-center text-green-600">
                ✓ Thank you! Your message has been sent. We will get back to you soon.
              </div>
            )}
            
            {error && (
              <div className="text-center text-red-600">
                {error}
              </div>
            )}
          </form>

          {/* Response Time Note */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">
              We typically respond within 24-48 hours
            </p>
          </div>
        </div>

        {/* Contact Information
        <div className="mt-8 bg-white p-6">
          <h3 className="text-lg font-light text-gray-900 mb-4">Other Ways to Reach Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
              <p className="mb-1">For general inquiries:</p>
              <a href="mailto:info@hostelmanagement.com" className="text-orange-500 hover:text-orange-600">
                info@hostelmanagement.com
              </a>
              <p className="mt-3 mb-1">For technical support:</p>
              <a href="mailto:support@hostelmanagement.com" className="text-orange-500 hover:text-orange-600">
                support@hostelmanagement.com
              </a>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Phone Support</h4>
              <p className="mb-1">Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p className="text-orange-500">+1 (555) 123-4567</p>
              <p className="mt-3 text-gray-500 text-xs">
                Emergency support available 24/7 for active residents
              </p>
            </div>
          </div>
        </div> */}

        {/* Social Links */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm text-gray-600 mb-4 text-center">Stay Connected</h3>
          <div className="flex justify-center space-x-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors"
                title={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Preview */}
        {/* <div className="mt-8 bg-white p-6">
          <h3 className="text-lg font-light text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">How long does it take to get a response?</h4>
              <p className="text-sm text-gray-600">
                We aim to respond to all inquiries within 24-48 hours during business days.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Do I need an account to contact support?</h4>
              <p className="text-sm text-gray-600">
                No, this contact form is available to everyone. However, for account-specific issues, 
                please <Link href="/login" className="text-orange-500 hover:text-orange-600">log in</Link> first.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">What information should I include?</h4>
              <p className="text-sm text-gray-600">
                Please provide as much detail as possible, including any relevant screenshots, 
                URLs, or steps to reproduce the issue.
              </p>
            </div>
          </div>
        </div> */}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Hostel Management System. All rights reserved.
          </p>
          <div className="mt-2 space-x-4 text-xs">
            <Link href="/privacy" className="text-gray-500 hover:text-orange-500">
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/terms" className="text-gray-500 hover:text-orange-500">
              Terms of Service
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/help" className="text-gray-500 hover:text-orange-500">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
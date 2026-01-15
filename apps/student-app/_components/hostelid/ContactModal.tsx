"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, User, Copy } from 'lucide-react';
import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostelName: string;
  contactInfo?: {
    admin?: string;
    phone?: string;
    email?: string;
  };
  roomTypeName?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  hostelName,
  contactInfo,
  roomTypeName,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-black">
                    Contact {hostelName}
                  </h3>
                  {roomTypeName && (
                    <p className="text-gray-600 text-sm mt-1">
                      For: {roomTypeName}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {contactInfo ? (
                <div className="space-y-6">
                  {contactInfo.admin && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Admin Contact
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(contactInfo.admin!, 'admin')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <Copy size={14} />
                          {copiedField === 'admin' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-black">
                        {contactInfo.admin}
                      </p>
                    </div>
                  )}

                  {contactInfo.phone && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Phone size={18} className="text-green-600" />
                          <span className="text-sm font-medium text-green-900">
                            Phone Number
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(contactInfo.phone!, 'phone')}
                          className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                        >
                          <Copy size={14} />
                          {copiedField === 'phone' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-lg font-semibold text-black hover:text-green-700 transition"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  )}

                  {/* {contactInfo.email && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Mail size={18} className="text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">
                            Email Address
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(contactInfo.email!, 'email')}
                          className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                        >
                          <Copy size={14} />
                          {copiedField === 'email' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-lg font-semibold text-black hover:text-purple-700 transition break-all"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  )} */}

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Tip:</strong> Use this contact information to:
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                      <li className="list-disc">Ask about current availability</li>
                      <li className="list-disc">Schedule a hostel tour</li>
                      <li className="list-disc">Discuss special requirements</li>
                      <li className="list-disc">Get more information about this room type</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                    <User size={24} className="text-yellow-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">
                    Contact Information Unavailable
                  </h4>
                  <p className="text-gray-600">
                    This hostel hasn't provided contact details yet. Please check back later or contact the hostel administration directly.
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full bg-black text-white py-3 px-4 font-medium rounded-lg hover:bg-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
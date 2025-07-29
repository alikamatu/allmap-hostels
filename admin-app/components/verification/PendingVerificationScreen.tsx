
"use client";

import { motion } from 'framer-motion';

const PendingVerificationScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          </motion.div>
        </div>
        
        <motion.h1 
          className="text-3xl font-bold text-gray-800 mb-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Application Under Review
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 mb-6"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your hostel admin application is currently being reviewed by our team.
          We'll notify you via email once the verification process is complete.
        </motion.p>
        
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <div className="h-4 w-64 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </div>
        </motion.div>
        
        <motion.p
          className="mt-8 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          This usually takes 1-2 business days
        </motion.p>
      </div>
    </motion.div>
  );
};

export default PendingVerificationScreen;
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  steps: { number: number; label: string }[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="mb-12">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2" />
        
        {/* Progress Line */}
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-black -translate-y-1/2"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: currentStep >= step.number ? '#000000' : '#FFFFFF',
                  borderColor: currentStep >= step.number ? '#000000' : '#E5E7EB',
                  scale: currentStep === step.number ? 1.2 : 1,
                }}
                className={`w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center transition-colors duration-300`}
              >
                {currentStep > step.number && (
                  <CheckIcon className="w-2.5 h-2.5 text-white stroke-[3]" />
                )}
              </motion.div>
              <div className="absolute -bottom-8">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${
                    currentStep >= step.number ? 'text-black' : 'text-gray-300'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
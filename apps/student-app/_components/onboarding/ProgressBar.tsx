import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  steps: { number: number; label: string }[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <motion.div
              initial={false}
              animate={{
                backgroundColor: currentStep >= step.number ? '#000000' : '#E5E7EB',
                scale: currentStep === step.number ? 1.1 : 1,
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
            >
              {currentStep > step.number ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                step.number
              )}
            </motion.div>
            {index < steps.length - 1 && (
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: currentStep > step.number ? '#000000' : '#E5E7EB',
                }}
                className="w-24 h-1 rounded"
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-32">
        {steps.map((step) => (
          <span
            key={step.number}
            className={`text-sm font-medium ${
              currentStep >= step.number ? 'text-black' : 'text-gray-400'
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};
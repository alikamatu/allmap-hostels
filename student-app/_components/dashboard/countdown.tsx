import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { usePaywall } from '@/context/paywall-context';

interface CountdownProps {
  timeLeft: number;
}

export const Countdown: React.FC<CountdownProps> = ({ timeLeft }) => {
  const { hasAccess, isPreview } = usePaywall();
  
  // Only show countdown if user has NO paid access AND is in preview mode AND has time left
  const shouldShow = !hasAccess && isPreview && timeLeft > 0;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 bg-black text-white p-3 flex items-center gap-2 border border-white shadow-lg"
        >
          <Clock size={20} />
          <span className="font-mono text-lg">{timeLeft}s</span>
          <span className="text-sm">free preview</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@repo/ui';
import React from 'react';

interface ErrorAlertProps {
  error: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <Alert variant="destructive" className="rounded-3xl border-none bg-red-50 text-red-900 shadow-lg shadow-red-900/5">
            <AlertCircle className="w-5 h-5" />
            <AlertDescription className="flex items-center justify-between font-bold text-xs uppercase tracking-wider">
              <span className="flex-1">{error}</span>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
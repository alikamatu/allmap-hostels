'use client';

import useLiveLocation from '@/lib/hooks/useLiveLocation';
import { motion } from 'framer-motion';
import { LocateFixed, LocateOff, Loader2 } from 'lucide-react';

export default function LocationIndicator() {
  const { lat, lng, error, loading } = useLiveLocation();
  
  const formatCoordinate = (coord: number) => coord.toFixed(6);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      ) : error ? (
        <LocateOff className="w-4 h-4 text-red-500" />
      ) : (
        <LocateFixed className="w-4 h-4 text-blue-500" />
      )}
      
      <div className="text-xs font-medium">
        {loading ? (
          <span>Getting location...</span>
        ) : error ? (
          <span className="text-red-500">Location disabled</span>
        ) : (
          <div className="flex flex-col">
            <span>{formatCoordinate(lat)}°N</span>
            <span>{formatCoordinate(lng)}°E</span>
          </div>
        )}
      </div>
      
      {!loading && !error && (
        <motion.div 
          className="h-2 w-2 rounded-full bg-green-500"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}
"use client"

import { motion } from 'framer-motion';
import { 
  Building2, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Search
} from 'lucide-react';
import { School } from '@repo/types';
import { Button, Input, Card } from '@repo/ui';
import React from 'react';

const formatLocation = (location: unknown): string => {
  if (!location) return 'Unknown location';
  if (typeof location === 'string') return location;
  if (typeof location === 'object' && location !== null) {
    const loc = location as { coordinates?: number[]; type?: string };
    if (loc.coordinates?.length === 2) {
      return `Lat: ${loc.coordinates[1].toFixed(3)}, Lng: ${loc.coordinates[0].toFixed(3)}`;
    }
    return loc.type || 'Invalid location';
  }
  return String(location);
};

interface SchoolSelectionStepProps {
  schools: School[];
  loadingSchools: boolean;
  searchQuery: string;
  selectedSchool: string;
  onSearchChange: (query: string) => void;
  onSchoolSelect: (schoolId: string) => void;
  onNext: () => void;
  onBack: () => void;
  error?: string;
}

export const SchoolSelectionStep: React.FC<SchoolSelectionStepProps> = ({
  schools,
  loadingSchools,
  searchQuery,
  selectedSchool,
  onSearchChange,
  onSchoolSelect,
  onNext,
  onBack,
  error,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Select School</h2>
        </div>
        <p className="text-gray-500 font-medium">
          Choose your institution to connect with relevant hostels.
        </p>
      </div>

      <div className="space-y-6">
        <Input
          icon={Search}
          placeholder="Search schools by name or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-gray-50 border-none rounded-2xl h-14 px-12"
        />

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {loadingSchools ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading schools...</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-medium italic">
                {searchQuery ? 'No schools found matching your search.' : 'No schools available.'}
              </p>
            </div>
          ) : (
            schools.map((school) => {
              const isSelected = selectedSchool === school.id;
              return (
                <motion.button
                  key={school.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSchoolSelect(school.id)}
                  className={`w-full text-left transition-all duration-300 rounded-3xl p-6 border ${
                    isSelected 
                      ? 'bg-black border-black shadow-xl shadow-black/10' 
                      : 'bg-white border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {school.name}
                      </h3>
                      <p className={`text-xs font-medium uppercase tracking-wider ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatLocation(school.location)} • {school.domain ?? 'General'}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="bg-white/20 p-2 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="h-14 px-8 rounded-2xl border-gray-200 font-bold flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedSchool}
          className="flex-1 h-14 rounded-2xl bg-black text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

// filepath: components/onboarding/SchoolSelectionStep.tsx

import { motion } from 'framer-motion';
import { 
  BuildingOffice2Icon, 
  ChevronRightIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { School } from '@/types/onboarding';

/**
 * Helper: Safely formats school.location values
 */
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
  error,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white -2 p-8">
        <div className="flex items-center mb-6">
          <BuildingOffice2Icon className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold text-black">Select Your School</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Choose your institution to connect with relevant hostels and accommodation options.
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search schools by name or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 -b-2 -gray-200 focus:-black outline-none text-black transition"
          />
        </div>

        <SchoolList
          schools={schools}
          loading={loadingSchools}
          selectedSchool={selectedSchool}
          onSchoolSelect={onSchoolSelect}
          searchQuery={searchQuery}
        />

        <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            disabled={!selectedSchool}
            className={`px-8 py-3 font-semibold flex items-center transition ${
              selectedSchool
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </motion.button>
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
        )}
      </div>
    </motion.div>
  );
};

const SchoolList: React.FC<{
  schools: School[];
  loading: boolean;
  selectedSchool: string;
  onSchoolSelect: (id: string) => void;
  searchQuery: string;
}> = ({ schools, loading, selectedSchool, onSchoolSelect, searchQuery }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 -2 -black -t-transparent rounded-full mx-auto mb-2"
        />
        <p className="text-gray-600">Loading schools...</p>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {searchQuery ? 'No schools found matching your search.' : 'No schools available.'}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {schools.map((school) => (
        <SchoolCard
          key={school.id}
          school={school}
          isSelected={selectedSchool === school.id}
          onSelect={onSchoolSelect}
        />
      ))}
    </div>
  );
};

const SchoolCard: React.FC<{
  school: School;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ school, isSelected, onSelect }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(school.id)}
    className={`w-full -2 text-left transition ${
      isSelected
        ? '-black bg-gray-300 text-white'
        : '-gray-200 hover:-gray-400'
    }`}
  >
    <div className="flex items-center justify-between hover:bg-gray-200 duration-300 p-4">
      <div>
        <h3 className="font-semibold text-gray-900 text-lg">{school.name}</h3>
        <p className={`text-sm ${isSelected ? 'text-gray-500' : 'text-gray-700'}`}>
          {formatLocation(school.location)} • {school.domain ?? 'No domain'}
        </p>
      </div>
      {isSelected && <CheckCircleIcon className="w-6 h-6" />}
    </div>
  </motion.button>
);

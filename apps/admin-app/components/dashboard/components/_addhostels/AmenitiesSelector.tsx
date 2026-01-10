import { motion } from 'framer-motion';
import { 
  Wifi, 
  Shirt, 
  Coffee, 
  Car, 
  Shield, 
  Dumbbell, 
  BookOpen, 
  ChefHat, 
  Wind, 
  Zap 
} from 'lucide-react';

interface AmenitiesData {
  wifi: boolean;
  laundry: boolean;
  cafeteria: boolean;
  parking: boolean;
  security: boolean;
  gym: boolean;
  studyRoom: boolean;
  kitchen: boolean;
  ac: boolean;
  generator: boolean;
}

interface AmenitiesSelectorProps {
  amenities: AmenitiesData;
  onAmenityChange: (amenity: string) => void;
}

const amenitiesList = [
  { 
    key: 'wifi', 
    label: 'WiFi', 
    icon: Wifi, 
    description: 'High-speed internet access' 
  },
  { 
    key: 'laundry', 
    label: 'Laundry', 
    icon: Shirt, 
    description: 'Washing and drying facilities' 
  },
  { 
    key: 'cafeteria', 
    label: 'Cafeteria', 
    icon: Coffee, 
    description: 'On-site dining options' 
  },
  { 
    key: 'parking', 
    label: 'Parking', 
    icon: Car, 
    description: 'Vehicle parking space' 
  },
  { 
    key: 'security', 
    label: 'Security', 
    icon: Shield, 
    description: '24/7 security service' 
  },
  { 
    key: 'gym', 
    label: 'Gym', 
    icon: Dumbbell, 
    description: 'Fitness center and equipment' 
  },
  { 
    key: 'studyRoom', 
    label: 'Study Room', 
    icon: BookOpen, 
    description: 'Quiet study areas' 
  },
  { 
    key: 'kitchen', 
    label: 'Kitchen', 
    icon: ChefHat, 
    description: 'Shared cooking facilities' 
  },
  { 
    key: 'ac', 
    label: 'Air Conditioning', 
    icon: Wind, 
    description: 'Climate control in rooms' 
  },
  { 
    key: 'generator', 
    label: 'Generator', 
    icon: Zap, 
    description: 'Backup power supply' 
  }
];

export default function AmenitiesSelector({ amenities, onAmenityChange }: AmenitiesSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
          AMENITIES
        </h3>
        <p className="text-xs text-gray-600 mt-1">Select the facilities and services your hostel offers</p>
      </motion.div>

      {/* Amenities Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {amenitiesList.map((amenity, index) => {
          const Icon = amenity.icon;
          const isSelected = amenities[amenity.key as keyof AmenitiesData];

          return (
            <motion.div
              key={amenity.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`p-3 cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onAmenityChange(amenity.key)}
            >
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {amenity.label}
                  </h4>
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-gray-100' : 'text-gray-500'}`}>
                    {amenity.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-4 h-4 border flex items-center justify-center ${
                    isSelected 
                      ? 'border-white bg-white' 
                      : 'border-gray-400 bg-white'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-[#FF6A00]"></div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.3 }}
        className="bg-gray-50 p-3"
      >
        <div className="flex items-start gap-3">
          <div className="text-[#FF6A00] mt-0.5">
            <Shield size={16} />
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-900">Pro Tip</h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Hostels with more amenities typically attract more students and can command higher prices. 
              Consider highlighting unique features that set your hostel apart from competitors.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Selection Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.4 }}
        className="text-center"
      >
        <p className="text-xs text-gray-600">
          Selected {Object.values(amenities).filter(Boolean).length} of {amenitiesList.length} amenities
        </p>
      </motion.div>
    </div>
  );
}
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Hostel Amenities</h3>
        <p className="text-gray-600">Select the facilities and services your hostel offers</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {amenitiesList.map((amenity, index) => {
          const Icon = amenity.icon;
          const isSelected = amenities[amenity.key as keyof AmenitiesData];

          return (
            <motion.div
              key={amenity.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-black bg-black text-white shadow-lg'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-md'
              }`}
              onClick={() => onAmenityChange(amenity.key)}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {amenity.label}
                  </h4>
                  <p className={`text-sm mt-1 ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                    {amenity.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-white bg-white' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-1">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Pro Tip</h4>
            <p className="text-sm text-blue-700 mt-1">
              Hostels with more amenities typically attract more students and can command higher prices. 
              Consider highlighting unique features that set your hostel apart from competitors.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <p className="text-sm text-gray-500">
          Selected {Object.values(amenities).filter(Boolean).length} of {amenitiesList.length} amenities
        </p>
      </motion.div>
    </div>
  );
}
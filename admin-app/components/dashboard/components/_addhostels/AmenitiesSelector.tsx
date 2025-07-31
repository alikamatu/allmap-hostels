import { motion } from 'framer-motion';
import { Wifi, Utensils, Car, Lock, BracesIcon } from 'lucide-react';

const amenitiesList = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'laundry', name: 'Laundry', icon: BracesIcon },
  { id: 'cafeteria', name: 'Cafeteria', icon: Utensils },
  { id: 'parking', name: 'Parking', icon: Car },
  { id: 'security', name: 'Security', icon: Lock }
];

export default function AmenitiesSelector({ amenities, onAmenityChange }: { amenities: Record<string, boolean>, onAmenityChange: (amenity: string) => void }) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Amenities</h2>
        <p className="text-gray-600 mb-6">
          Choose the facilities your hostel offers to students
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {amenitiesList.map((amenity, index) => (
          <motion.button
            key={amenity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            onClick={() => onAmenityChange(amenity.id)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 ${
              amenities[amenity.id] 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200 hover:border-gray-400'
            } transition-colors`}
          >
            <amenity.icon
              size={32}
              className={`mb-3 ${
                amenities[amenity.id] ? 'text-black' : 'text-gray-400'
              }`}
            />
            <span className={`font-medium ${
              amenities[amenity.id] ? 'text-black' : 'text-gray-600'
            }`}>
              {amenity.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
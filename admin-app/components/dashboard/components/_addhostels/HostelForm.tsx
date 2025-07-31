import { motion } from 'framer-motion';

export default function HostelForm({ hostelData, handleInputChange }: { hostelData: { name: string, description: string, schoolId: string }, handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hostel Name *
        </label>
        <input
          type="text"
          name="name"
          value={hostelData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          placeholder="Enter hostel name"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={hostelData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          placeholder="Describe your hostel facilities, rooms, and unique features"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          School ID
        </label>
        <input
          type="text"
          name="schoolId"
          value={hostelData.schoolId}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          placeholder="Enter associated school ID"
        />
      </motion.div>
    </div>
  );
}
import { motion } from 'framer-motion';

export default function HostelForm({ hostelData, handleInputChange, handleEmailChange, handlePhoneChange, handleSecondaryPhoneChange }: { hostelData: { name: string, description: string, email: string, phone: string, SecondaryNumber: string }, handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, handleEmailChange: (email: string) => void, handlePhoneChange: (phone: string) => void, handleSecondaryPhoneChange: (SecondaryNumber: string) => void }) {
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
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={hostelData.email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          placeholder="Enter hostel email"
          required
        />
      </motion.div>



      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone *
        </label>
        <input
          type="tel"
          name="phone"
          value={hostelData.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          placeholder="Enter hostel phone"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secondary Phone *
        </label>
        <input
          type="tel"
          name="SecondaryNumber"
          value={hostelData.SecondaryNumber}
          onChange={(e) => handleSecondaryPhoneChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          placeholder="Enter secondary phone"
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
        {/* <label className="block text-sm font-medium text-gray-700 mb-1">
          School ID
        </label>
        <input
          type="text"
          name="schoolId"
          value={hostelData.schoolId}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          placeholder="Enter associated school ID"
        /> */}
      </motion.div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';

export default function ImageUploader({ images, onUpload, onRemove }: { images: File[], onUpload: (files: File[]) => void, onRemove: (index: number) => void }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
          HOSTEL IMAGES
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Add photos of your hostel to attract more students
        </p>
      </motion.div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Upload Button */}
        <motion.label
          whileHover={{ backgroundColor: '#f3f4f6' }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center h-32 bg-gray-50 cursor-pointer transition-colors duration-150 border border-gray-200"
        >
          <Plus className="w-6 h-6 text-gray-400 mb-1" />
          <span className="text-xs text-gray-600 font-medium">Add Photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.label>

        {/* Uploaded Images */}
        {images.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="h-32 relative group bg-gray-50"
          >
            <Image
              src={URL.createObjectURL(file)}
              alt={`Hostel preview ${index + 1}`}
              className="w-full h-full object-cover"
              width={200}
              height={128}
            />
            <motion.button
              type="button"
              whileHover={{ backgroundColor: '#e55e00' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 bg-[#FF6A00] text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Image Count */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-600"
        >
          {images.length} photo{images.length !== 1 ? 's' : ''} selected
        </motion.div>
      )}
    </div>
  );
}
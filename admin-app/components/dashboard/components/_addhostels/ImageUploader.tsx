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
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Images</h2>
        <p className="text-gray-600">
          Add photos of your hostel to attract more students
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Image upload button */}
        <motion.label
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 transition-colors"
        >
          <Plus className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-gray-600 font-medium">Add Photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.label>

        {/* Uploaded images */}
        {images.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-48 rounded-2xl overflow-hidden relative group"
          >
            <Image
              src={URL.createObjectURL(file)}
              alt={`Hostel preview ${index + 1}`}
              className="w-full h-full object-cover"
              width={100}
              height={100}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
          </motion.div>
        ))}
      </div>

      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-sm text-gray-500"
        >
          {images.length} photo{images.length !== 1 ? 's' : ''} selected
        </motion.div>
      )}
    </div>
  );
}
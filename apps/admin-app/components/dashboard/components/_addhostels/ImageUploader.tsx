import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

// Helper to optimize image
const optimizeImage = async (file: File): Promise<File> => {
  let currentFile = file;

  // 1. Handle HEIC/HEIF
  const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                 file.name.toLowerCase().endsWith('.heif') || 
                 file.type === 'image/heic' || 
                 file.type === 'image/heif';

  if (isHeic) {
    try {
      const heic2any = (await import('heic2any')).default;
      const blob = await heic2any({ 
        blob: file, 
        toType: 'image/jpeg',
        quality: 0.8
      });
      const resultBlob = Array.isArray(blob) ? blob[0] : blob;
      currentFile = new File(
        [resultBlob], 
        file.name.replace(/\.[^/.]+$/, "") + ".jpg", 
        { type: 'image/jpeg' }
      );
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      // Fallback to original file if conversion fails
    }
  }

  // 2. Optimization using Canvas
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(currentFile);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions for web optimization
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(currentFile);

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first with decent quality
        const getBlob = (quality: number): Promise<Blob | null> => {
          return new Promise(resolveBlob => {
            canvas.toBlob(resolveBlob, 'image/webp', quality);
          });
        };

        const attemptOptimization = async (quality: number): Promise<File> => {
          const blob = await getBlob(quality);
          if (!blob) return currentFile;

          // If size is still > 1MB and quality is > 0.3, try lower quality
          if (blob.size > 1024 * 1024 && quality > 0.3) {
            return attemptOptimization(quality - 0.1);
          }

          return new File(
            [blob], 
            file.name.replace(/\.[^/.]+$/, "") + ".webp", 
            { type: 'image/webp', lastModified: Date.now() }
          );
        };

        attemptOptimization(0.8).then(resolve);
      };
      img.onerror = () => resolve(currentFile);
    };
    reader.onerror = () => resolve(currentFile);
  });
};

export default function ImageUploader({ 
  images, 
  onUpload, 
  onRemove 
}: { 
  images: File[], 
  onUpload: (files: File[]) => void, 
  onRemove: (index: number) => void 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState({ current: 0, total: 0 });

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setIsProcessing(true);
      setProcessingCount({ current: 0, total: newFiles.length });

      const optimizedFiles: File[] = [];
      
      for (let i = 0; i < newFiles.length; i++) {
        setProcessingCount(prev => ({ ...prev, current: i + 1 }));
        const optimized = await optimizeImage(newFiles[i]);
        optimizedFiles.push(optimized);
      }

      onUpload(optimizedFiles);
      setIsProcessing(false);
      setProcessingCount({ current: 0, total: 0 });
      
      // Reset input
      e.target.value = '';
    }
  }, [onUpload]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-semibold text-gray-900">
            HOSTEL IMAGES
          </h3>
          <span className="text-[10px] font-medium text-[#FF6A00] bg-orange-50 px-2 py-0.5 uppercase tracking-wider">
            Optimized for Speed
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Photos will be automatically converted to WebP and optimized for fast loading. HEIC supported.
        </p>
      </motion.div>

      {/* Processing Status */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-orange-50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-[#FF6A00] animate-spin" />
                <span className="text-xs font-medium text-gray-700">
                  Processing and optimizing images... ({processingCount.current}/{processingCount.total})
                </span>
              </div>
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#FF6A00]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(processingCount.current / processingCount.total) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Upload Button */}
        <motion.label
          whileHover={{ backgroundColor: '#f3f4f6', borderColor: '#FF6A00' }}
          whileTap={{ scale: 0.98 }}
          className={`flex flex-col items-center justify-center aspect-square bg-gray-50 cursor-pointer transition-all duration-150 border-2 border-dashed border-gray-200 ${
            isProcessing ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div className="bg-white p-2 rounded-full shadow-sm mb-2">
            <Plus className="w-5 h-5 text-[#FF6A00]" />
          </div>
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">Add Photos</span>
          <input
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            disabled={isProcessing}
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.label>

        {/* Uploaded Images */}
        <AnimatePresence mode="popLayout">
          {images.map((file, index) => (
            <motion.div
              key={`${file.name}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="aspect-square relative group bg-gray-100 overflow-hidden"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={`Hostel preview ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                width={200}
                height={200}
              />
              
              {/* Badge for WebP/Optimized */}
              <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                <CheckCircle2 size={8} className="text-green-400" />
                <span className="text-[8px] text-white font-medium uppercase">WebP • {(file.size / 1024).toFixed(0)}KB</span>
              </div>

              <motion.button
                type="button"
                whileHover={{ backgroundColor: '#cc5500' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 bg-[#FF6A00] text-white p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                <X size={14} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Image Count & Info */}
      {images.length > 0 && !isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between text-[10px] font-medium text-gray-500 uppercase tracking-wider"
        >
          <span>{images.length} photo{images.length !== 1 ? 's' : ''} ready for upload</span>
          <div className="flex items-center gap-2">
            <ImageIcon size={10} />
            <span>Total size: {(images.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
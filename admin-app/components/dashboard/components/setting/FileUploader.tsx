'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { File, Upload, X } from 'lucide-react';

export default function FileUploader({
  label,
  description,
  accept,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  onFilesChange
}: {
  label: string;
  description: string;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesChange: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any) => {
    setError(null);
    
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`File exceeds max size of ${maxSize / (1024 * 1024)}MB`);
      } else {
        setError(rejection.errors[0].message);
      }
      return;
    }

    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, maxFiles, maxSize]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles
  });

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <p className="text-xs text-gray-500">
          {description}
        </p>
      </div>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          {isDragActive ? (
            <p className="text-sm text-gray-600">Drop files here</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Drag & drop files here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                Max {maxFiles} file(s) • Max size: {maxSize / (1024 * 1024)}MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-medium text-gray-500">Selected files:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <motion.li 
                key={file.name + index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center">
                  <File className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
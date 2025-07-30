"use client";

import { FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const DocumentList = ({ documents, title }: { documents: string[]; title: string }) => (
  <div>
    <h5 className="text-xl font-bold text-gray-700 mb-2">{title}</h5>
    <div className="flex flex-wrap gap-2">
      {documents.map((doc, index) => (
        <motion.a
          key={index}
          href={doc}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-4 py-2 rounded-lg text-xl"
        >
          <FiDownload className="mr-2" /> {title.split(' ')[0]} {index + 1}
        </motion.a>
      ))}
    </div>
  </div>
);
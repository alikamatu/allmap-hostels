// 'use client';

// import { AccessFilters } from '@/types/access.types';
// import { X, Filter, Calendar } from 'lucide-react';
// import

// interface AccessFiltersPanelProps {
//   filters: AccessFilters;
//   onFilterChange: (filters: Partial<AccessFilters>) => void;
//   onClose: () => void;
// }

// const SOURCE_OPTIONS = [
//   { value: '', label: 'All Sources' },
//   { value: 'paystack', label: 'Paystack' },
//   { value: 'manual_grant', label: 'Manual Grant' },
//   { value: 'free_trial', label: 'Free Trial' },
// ];

// const STATUS_OPTIONS = [
//   { value: '', label: 'All Status' },
//   { value: 'active', label: 'Active' },
//   { value: 'expired', label: 'Expired' },
//   { value: 'upcoming', label: 'Upcoming (30 days)' },
// ];

// export default function AccessFiltersPanel({
//   filters,
//   onFilterChange,
//   onClose,
// }: AccessFiltersPanelProps) {
//   const handleSourceChange = (value: string) => {
//     onFilterChange({ source: value || undefined });
//   };

//   const handleStatusChange = (value: string) => {
//     onFilterChange({ status: value as AccessFilters['status'] });
//   };

//   const handleDateFilter = (type: 'start' | 'end', date: string) => {
//     const newDateFilter = filters.dateFilter || {};
//     if (type === 'start') {
//       newDateFilter.startDate = date;
//     } else {
//       newDateFilter.endDate = date;
//     }
//     onFilterChange({ dateFilter: newDateFilter });
//   };

//   const handleReset = () => {
//     onFilterChange({
//       source: undefined,
//       status: undefined,
//       dateFilter: undefined,
//     });
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, height: 0 }}
//       animate={{ opacity: 1, height: 'auto' }}
//       exit={{ opacity: 0, height: 0 }}
//       className="overflow-hidden"
//     >
//       <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <Filter size={14} />
//             <span className="text-12 font-medium text-gray-900">Filters</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleReset}
//               className="text-11 font-medium text-gray-600 hover:text-gray-900"
//             >
//               Clear All
//             </button>
//             <button
//               onClick={onClose}
//               className="p-1 hover:bg-gray-200 rounded"
//             >
//               <X size={14} className="text-gray-600" />
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Source Filter */}
//           <div>
//             <label className="block text-11 font-medium text-gray-700 mb-1">
//               Access Source
//             </label>
//             <select
//               value={filters.source || ''}
//               onChange={(e) => handleSourceChange(e.target.value)}
//               className="w-full border border-gray-300 rounded px-3 py-2 text-12 focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
//             >
//               {SOURCE_OPTIONS.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Status Filter */}
//           <div>
//             <label className="block text-11 font-medium text-gray-700 mb-1">
//               Status
//             </label>
//             <select
//               value={filters.status || ''}
//               onChange={(e) => handleStatusChange(e.target.value)}
//               className="w-full border border-gray-300 rounded px-3 py-2 text-12 focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
//             >
//               {STATUS_OPTIONS.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Date Range Filter */}
//           <div className="space-y-2">
//             <label className="block text-11 font-medium text-gray-700">
//               Date Range
//             </label>
//             <div className="flex items-center gap-2">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Calendar size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="date"
//                     value={filters.dateFilter?.startDate || ''}
//                     onChange={(e) => handleDateFilter('start', e.target.value)}
//                     className="w-full pl-8 pr-2 py-2 text-11 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
//                   />
//                 </div>
//               </div>
//               <span className="text-11 text-gray-500">to</span>
//               <div className="flex-1">
//                 <div className="relative">
//                   <Calendar size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="date"
//                     value={filters.dateFilter?.endDate || ''}
//                     onChange={(e) => handleDateFilter('end', e.target.value)}
//                     className="w-full pl-8 pr-2 py-2 text-11 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
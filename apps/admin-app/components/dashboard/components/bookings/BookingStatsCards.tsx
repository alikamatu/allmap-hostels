"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  occupancyRate: number;
}

interface BookingStatsCardsProps {
  stats: BookingStats | null | undefined;
  loading: boolean;
}

const DEFAULT: BookingStats = {
  total: 0, pending: 0, confirmed: 0, checkedIn: 0,
  checkedOut: 0, cancelled: 0, totalRevenue: 0,
  paidRevenue: 0, pendingRevenue: 0, occupancyRate: 0,
};

type Color = 'orange' | 'blue' | 'green' | 'yellow';

const COLOR_MAP: Record<Color, { bg: string; light: string; text: string; bar: string }> = {
  orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-500' },
  blue:   { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-600',   bar: 'bg-blue-500' },
  green:  { bg: 'bg-green-500',  light: 'bg-green-50',  text: 'text-green-600',  bar: 'bg-green-500' },
  yellow: { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600', bar: 'bg-yellow-400' },
};

const BookingStatsCards: React.FC<BookingStatsCardsProps> = ({ stats, loading }) => {
  const s = stats || DEFAULT;

  if (!loading && !stats) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-600" />
        Unable to load booking statistics.
      </div>
    );
  }

  const cards: { title: string; value: string | number; icon: React.ReactNode; color: Color; sub: string; extra?: React.ReactNode }[] = [
    {
      title: 'Total',
      value: s.total,
      icon: <Users className="h-3.5 w-3.5" />,
      color: 'orange',
      sub: 'All bookings',
      extra: s.occupancyRate > 0 ? (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Occupancy</span><span className="font-medium">{s.occupancyRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(s.occupancyRate, 100)}%` }}
              transition={{ duration: 0.5 }}
              className="h-1 bg-orange-500 rounded-full"
            />
          </div>
        </div>
      ) : null,
    },
    {
      title: 'Pending',
      value: s.pending,
      icon: <Clock className="h-3.5 w-3.5" />,
      color: 'yellow',
      sub: 'Needs confirmation',
    },
    {
      title: 'Active',
      value: s.checkedIn,
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      color: 'green',
      sub: 'Currently staying',
    },
    {
      title: 'Revenue',
      value: formatCurrency(s.paidRevenue),
      icon: <DollarSign className="h-3.5 w-3.5" />,
      color: 'blue',
      sub: `of ${formatCurrency(s.totalRevenue)} total`,
      extra: s.totalRevenue > 0 ? (
        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
          <span>Collection</span>
          <span className="font-medium flex items-center gap-0.5">
            <TrendingUp className="h-2.5 w-2.5 text-green-500" />
            {((s.paidRevenue / s.totalRevenue) * 100).toFixed(0)}%
          </span>
        </div>
      ) : null,
    },
  ];

  if (loading) {
    return (
      <>
        {/* Mobile: horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-1 md:hidden snap-x snap-mandatory">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="snap-start flex-shrink-0 w-36 bg-white border border-gray-200 rounded-xl p-3 animate-pulse">
              <div className="w-7 h-7 bg-gray-100 rounded-lg mb-2" />
              <div className="w-12 h-4 bg-gray-100 rounded mb-1" />
              <div className="w-16 h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-lg mb-3" />
              <div className="w-16 h-5 bg-gray-100 rounded mb-1" />
              <div className="w-20 h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile: horizontal scroll row */}
      <div className="flex gap-3 overflow-x-auto pb-1 md:hidden snap-x snap-mandatory scrollbar-none">
        {cards.map((card, i) => {
          const c = COLOR_MAP[card.color];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="snap-start flex-shrink-0 w-36 bg-white border border-gray-200 rounded-xl p-3"
            >
              <div className={`inline-flex p-1.5 ${c.light} rounded-lg mb-2`}>
                <span className={c.text}>{card.icon}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{card.title}</p>
              <p className="text-base font-semibold text-gray-900 truncate">{card.value}</p>
              {card.extra}
            </motion.div>
          );
        })}
      </div>

      {/* Desktop: 4-column grid */}
      <div className="hidden md:grid grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const c = COLOR_MAP[card.color];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 ${c.light} rounded-lg`}>
                  <span className={c.text}>{card.icon}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{card.title}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              {card.extra}
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default BookingStatsCards;

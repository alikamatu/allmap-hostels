"use client";

import { useReviews } from "@repo/shared/hooks";
import Link from "next/link";
import {
  FaStar,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Hostel } from "@repo/types";
import { formatPrice } from "@/utils/formatters";

interface HostelHeaderProps {
  hostel: Hostel;
}

export const HostelHeader = ({ hostel }: HostelHeaderProps) => {
  const roomPrices =
    hostel.roomTypes
      ?.map((rt) => rt.pricePerSemester)
      .filter((p) => typeof p === "number" && p > 0) || [];
  const startingPrice =
    roomPrices.length > 0
      ? Math.min(...roomPrices)
      : (hostel as unknown as { base_price?: number }).base_price || 0;

  // Use real reviews data from API
  const { stats, loading: reviewsLoading } = useReviews(hostel.id);

  const totalReviews =
    stats?.totalReviews ??
    (typeof hostel.reviews === "number" ? hostel.reviews : 0);
  const averageRating =
    totalReviews > 0 ? (stats?.averageRating ?? hostel.rating ?? 0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-6 sm:mb-8"
    >
      {/* Top Bar: Back Link */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors group"
        >
          <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
          <span>Back to Hostels</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            {hostel.accepting_bookings ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Accepting Bookings
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Bookings Closed
              </span>
            )}

            {hostel.is_verified ? (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                <FaCheckCircle className="text-xs text-blue-500" />
                Verified Hostel
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Listed
              </span>
            )}
          </div>

          {/* Hostel Name */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
            {hostel.name}
          </h1>

          {/* Rating and Reviews */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-2 text-sm">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-xs ${i < Math.floor(averageRating) ? "text-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-gray-900 font-semibold text-xs sm:text-sm">
              {reviewsLoading ? (
                <span className="text-gray-400">Loading reviews...</span>
              ) : totalReviews > 0 ? (
                <>
                  {averageRating.toFixed(1)}{" "}
                  <span className="font-normal text-gray-500">
                    ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </>
              ) : (
                <span className="font-normal text-gray-500">
                  No reviews yet
                </span>
              )}
            </span>

            {/* Address */}
            {hostel.address && (
              <div className="flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm">
                <span className="text-gray-300 hidden sm:inline">•</span>
                <FaMapMarkerAlt className="text-gray-400 text-xs flex-shrink-0" />
                <span className="truncate max-w-md">{hostel.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price Cardlet on Desktop */}
        {startingPrice > 0 && (
          <div className="hidden md:flex flex-col items-end justify-center bg-gray-50 border border-gray-200/80 rounded-2xl px-5 py-3 text-right">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-0.5">
              Starting from
            </span>
            <div className="text-2xl font-black text-gray-950 tracking-tight">
              {formatPrice(startingPrice)}
            </div>
            <span className="text-xs text-gray-500">per semester</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

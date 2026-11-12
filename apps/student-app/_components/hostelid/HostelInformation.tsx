"use client";

import { motion } from "framer-motion";
import { Hostel } from "@repo/types";
import { formatPrice } from "@/utils/formatters";
import { FaMapMarkerAlt, FaBed, FaDoorOpen, FaShieldAlt } from "react-icons/fa";

interface HostelInformationProps {
  hostel: Hostel;
  onShowMap: () => void;
}

export const HostelInformation = ({
  hostel,
  onShowMap,
}: HostelInformationProps) => {
  const roomTypes = hostel.roomTypes || [];
  const totalAvailableRooms = roomTypes.reduce(
    (sum, rt) => sum + (rt.availableRooms || 0),
    0,
  );

  const validPrices = roomTypes
    .map((rt) => rt.pricePerSemester || rt.pricePerMonth)
    .filter((p) => typeof p === "number" && p > 0);
  const minPrice =
    validPrices.length > 0
      ? Math.min(...validPrices)
      : (hostel as unknown as { base_price?: number }).base_price || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="md:col-span-1 lg:sticky lg:top-24 h-fit"
    >
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950 mb-4 pb-3 border-b border-gray-100">
          Hostel Overview
        </h2>

        <div className="space-y-5">
          {/* Location Block */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              <FaMapMarkerAlt className="text-gray-400" />
              <span>Location</span>
            </div>
            <p className="text-sm text-gray-700 leading-snug mb-2.5">
              {hostel.address || "Address provided upon inquiry"}
            </p>
            <button
              type="button"
              onClick={onShowMap}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:text-gray-700 hover:underline transition"
            >
              <span>Explore on interactive map</span>
              <span>→</span>
            </button>
          </div>

          {/* Quick Stats Block */}
          <div className="pt-4 border-t border-gray-100">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Room Availability
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  <FaDoorOpen className="text-gray-400 text-xs" />
                  Room Types
                </span>
                <span className="font-semibold text-gray-900">
                  {roomTypes.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  <FaBed className="text-gray-400 text-xs" />
                  Vacant Rooms
                </span>
                <span
                  className={`font-semibold ${totalAvailableRooms > 0 ? "text-emerald-600" : "text-gray-500"}`}
                >
                  {totalAvailableRooms > 0
                    ? `${totalAvailableRooms} available`
                    : "Full / On request"}
                </span>
              </div>
              {minPrice > 0 && (
                <div className="flex items-center justify-between text-gray-600 pt-1 border-t border-dashed border-gray-100">
                  <span>Starting From</span>
                  <span className="font-bold text-gray-950">
                    {formatPrice(minPrice)}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      / sem
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Trust Banner */}
          <div className="pt-4 border-t border-gray-100 flex items-start gap-3 bg-gray-50/80 p-3 rounded-xl">
            <FaShieldAlt className="text-emerald-600 text-base mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">
              {hostel.is_verified
                ? "Verified student accommodation verified by AllMap inspection standards."
                : "Direct listing. Contact management to schedule viewing before making payments."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

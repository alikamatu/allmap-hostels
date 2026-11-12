"use client";

import { usePaywall } from "@repo/shared/context";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { HostelCard } from "@repo/types";
import { useRouter } from "next/navigation";

interface HostelListProps {
  hostels: HostelCard[];
}

export const HostelList: React.FC<HostelListProps> = ({ hostels }) => {
  const { hasAccess, unlockAccess } = usePaywall();
  const router = useRouter();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const canView = hasAccess;

  if (hostels.length === 0) {
    return (
      <div className="col-span-full text-center py-12 border border-gray-200 rounded-2xl bg-gray-50/50">
        <p className="text-gray-900 font-medium text-lg">
          No hostels match your filters
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Try adjusting your search or distance criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {hostels.map((hostel, index) => {
        const isPriority = index < 4;
        const hasFailedImage = failedImages[hostel.id];

        return (
          <motion.div
            key={hostel.id}
            onClick={() => router.push(`/dashboard/hostels/${hostel.id}`)}
            onMouseEnter={() =>
              router.prefetch(`/dashboard/hostels/${hostel.id}`)
            }
            className="group block overflow-hidden cursor-pointer relative"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
              {hostel.imageUrl && !hasFailedImage ? (
                <Image
                  src={hostel.imageUrl}
                  alt={hostel.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  priority={isPriority}
                  loading={isPriority ? "eager" : "lazy"}
                  onError={() => {
                    setFailedImages((prev) => ({ ...prev, [hostel.id]: true }));
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
                  <span className="text-2xl mb-1">🏠</span>
                  <span className="text-xs font-medium text-gray-500">
                    No Image
                  </span>
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                {hostel.accepting_bookings ? (
                  <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                    Accepting Bookings
                  </span>
                ) : (
                  <span className="bg-rose-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                    Bookings Closed
                  </span>
                )}
              </div>

              {!hostel.is_verified && (
                <span className="absolute top-2.5 right-2.5 bg-neutral-900/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-10">
                  Listed
                </span>
              )}
            </div>

            <div className="pt-2.5 px-0.5">
              <h2 className="text-base font-semibold text-gray-900 truncate group-hover:text-black">
                {hostel.name}
              </h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {hostel.address || "Address on file"}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-sm font-bold text-gray-950">
                  {hostel.base_price
                    ? `GHC ${Number(hostel.base_price).toLocaleString()}`
                    : "Price on request"}
                  <span className="text-[11px] font-normal text-gray-500 ml-1">
                    / sem
                  </span>
                </span>
                {hostel.distance != null && (
                  <span className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {Number(hostel.distance).toFixed(1)} km
                  </span>
                )}
              </div>
            </div>

            {/* Locked interaction */}
            {!canView && (
              <div
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  unlockAccess();
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

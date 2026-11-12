"use client";

import React from "react";
import { Skeleton, cn } from "@repo/ui";

/**
 * Signature mobile-first skeleton for Auth (/login, /sign-up, /auth/callback, /verify-email, /reset-password)
 */
export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 sm:py-12 px-4 font-sans">
      <div className="max-w-md w-full">
        {/* Brand Logo & Heading */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Skeleton className="h-11 w-11 rounded-xl mb-4" />
          <Skeleton className="h-7 w-40 rounded-lg mb-2" />
          <Skeleton className="h-4 w-52 rounded-md" />
        </div>

        {/* Segmented Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6 sm:mb-8 gap-1">
          <Skeleton className="h-10 flex-1 rounded-lg bg-white" />
          <Skeleton className="h-10 flex-1 rounded-lg bg-gray-200/60" />
        </div>

        {/* Form Inputs */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-11 sm:h-12 w-full rounded-none border-b border-gray-200 bg-gray-100/70" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-11 sm:h-12 w-full rounded-none border-b border-gray-200 bg-gray-100/70" />
          </div>

          <div className="flex justify-between items-center pt-1">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>

          {/* Primary Action Button */}
          <Skeleton className="h-14 w-full rounded-xl" />

          {/* Divider */}
          <div className="py-2 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <Skeleton className="h-3 w-28 rounded" />
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google OAuth Button */}
          <Skeleton className="h-14 w-full rounded-xl bg-gray-100" />
        </div>

        {/* Footer copyright */}
        <div className="mt-8 flex justify-center">
          <Skeleton className="h-3.5 w-48 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Signature mobile-first skeleton for Onboarding (/onboarding)
 */
export function OnboardingPageSkeleton() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 sm:py-12 px-4 font-sans">
      <div className="max-w-md w-full">
        {/* Brand Logo & Heading */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Skeleton className="h-11 w-11 rounded-xl mb-4" />
          <Skeleton className="h-7 w-40 rounded-lg mb-2" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>

        {/* 3-Step Segmented Progress Pill */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6 sm:mb-8 gap-1">
          <Skeleton className="h-10 flex-1 rounded-lg bg-white" />
          <Skeleton className="h-10 flex-1 rounded-lg bg-gray-200/60" />
          <Skeleton className="h-10 flex-1 rounded-lg bg-gray-200/60" />
        </div>

        {/* Step Form Fields */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-11 sm:h-12 w-full rounded-none border-b border-gray-200 bg-gray-100/70" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16 rounded" />
              <Skeleton className="h-11 sm:h-12 w-full rounded-none border-b border-gray-200 bg-gray-100/70" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-11 sm:h-12 w-full rounded-none border-b border-gray-200 bg-gray-100/70" />
            </div>
          </div>

          <div className="pt-2">
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>

        {/* Footer copyright */}
        <div className="mt-8 flex justify-center">
          <Skeleton className="h-3.5 w-48 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline skeleton for the school list inside Step 2 of Onboarding
 */
export function SchoolListSkeleton() {
  return (
    <div className="space-y-2 pr-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="w-full p-3.5 rounded-xl border border-gray-100 flex items-center justify-between gap-3"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * Signature skeleton for the Dashboard Hostel Grid & Filter section
 */
export function DashboardContentSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
      {/* Desktop Filter Panel Skeleton */}
      <div className="hidden md:block md:col-span-1 sticky top-24 space-y-6 p-5 border border-gray-100 rounded-2xl h-fit">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-6 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Hostels Grid Skeleton */}
      <div className="md:col-span-2 lg:col-span-3">
        <Skeleton className="h-4 w-48 mb-6 rounded" />
        <Skeleton className="h-6 w-52 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-64 mb-5 rounded" />

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-5 w-4/5 rounded-md mt-2" />
              <Skeleton className="h-4 w-3/5 rounded-md" />
              <div className="flex justify-between items-center pt-1">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Full Dashboard Page Skeleton (/dashboard)
 */
export function DashboardPageSkeleton({
  withNavbar = false,
}: {
  withNavbar?: boolean;
}) {
  return (
    <div className="bg-white font-sans min-h-screen">
      {withNavbar && (
        <div className="border-b border-gray-100 h-16 px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto mb-6">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 border border-gray-100 rounded-2xl space-y-3">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-8 w-80 rounded-lg" />
          <Skeleton className="h-4 w-60 rounded" />
        </div>
        <DashboardContentSkeleton />
      </div>
    </div>
  );
}

/**
 * Map View Skeleton
 */
export function MapViewSkeleton() {
  return (
    <div className="h-[400px] sm:h-[600px] w-full rounded-2xl overflow-hidden border border-gray-100 relative">
      <Skeleton className="h-full w-full rounded-2xl" />
    </div>
  );
}

/**
 * Hostel Detail Page Skeleton (/dashboard/hostels/[id])
 */
export function HostelDetailPageSkeleton() {
  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Back link & Title */}
        <Skeleton className="h-4 w-28 rounded" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 sm:w-80 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Image Gallery Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[260px] sm:h-[400px]">
          <Skeleton className="md:col-span-2 h-full w-full rounded-2xl" />
          <div className="hidden md:grid grid-cols-2 gap-3 md:col-span-2 h-full">
            <Skeleton className="h-full w-full rounded-2xl" />
            <Skeleton className="h-full w-full rounded-2xl" />
            <Skeleton className="h-full w-full rounded-2xl" />
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        </div>

        {/* Info & Room Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-1 space-y-4 p-5 border border-gray-100 rounded-2xl h-fit">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 border border-gray-100 rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-32 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-7 w-28 rounded-md" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Room Type Detail Page Skeleton (/dashboard/hostels/[id]/room-types/[roomTypeId])
 */
export function RoomDetailPageSkeleton() {
  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-4 w-36 mb-6 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 sm:p-8 border border-gray-100 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-56 rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-36 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border border-gray-100 rounded-2xl space-y-5 h-fit">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Bookings Page Skeleton (/dashboard/bookings)
 */
export function BookingsPageSkeleton() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 border border-gray-100 rounded-2xl space-y-2"
            >
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-7 w-16 rounded-md" />
            </div>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-5 border border-gray-100 rounded-2xl flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-48 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64 rounded" />
                <div className="flex flex-wrap gap-4 pt-1">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
              <div className="flex sm:flex-col justify-end gap-2">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Page Skeleton (/dashboard/profile)
 */
export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "p-6 border border-gray-100 rounded-2xl space-y-4",
                i === 2 && "md:col-span-2",
              )}
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-5 w-40 rounded" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-5 w-36 rounded" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-5 w-32 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

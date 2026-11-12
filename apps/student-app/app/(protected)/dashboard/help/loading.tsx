"use client";

import React from "react";
import { Skeleton } from "@repo/ui";

export function SimplePageSkeleton({
  titleWidth = "w-48",
  subtitleWidth = "w-72",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
}) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className={`h-8 ${titleWidth} rounded-lg`} />
          <Skeleton className={`h-4 ${subtitleWidth} rounded`} />
        </div>
        <div className="p-6 border border-gray-100 rounded-2xl space-y-4">
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-12 w-full rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return <SimplePageSkeleton />;
}

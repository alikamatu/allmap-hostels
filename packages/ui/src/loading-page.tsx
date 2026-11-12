"use client";
import React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "./lib/utils";

interface LoadingPageProps {
  text?: string;
  className?: string;
  fullScreen?: boolean;
  onClick?: () => void;
}

export const LoadingPage = ({
  className,
  fullScreen = true,
  onClick,
}: LoadingPageProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white font-sans",
        fullScreen ? "min-h-screen w-full" : "h-full w-full py-10",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex justify-end mb-6">
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-56 mb-8 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <div className="flex justify-between items-center pt-1">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

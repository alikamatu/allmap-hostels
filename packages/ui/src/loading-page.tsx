"use client";
import React from "react";
import { LoaderOne } from "./loader";
import { cn } from "./lib/utils";

interface LoadingPageProps {
  text?: string;
  className?: string;
  fullScreen?: boolean;
  onClick?: () => void;
}

export const LoadingPage = ({
  text = "Loading...",
  className,
  fullScreen = true,
  onClick,
}: LoadingPageProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center bg-background",
        fullScreen ? "fixed inset-0 z-50 h-screen w-screen" : "h-full w-full py-10",
        className
      )}
    >
      <LoaderOne />
      {text && (
        <p className="mt-4 animate-pulse text-sm font-medium text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  );
};

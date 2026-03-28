"use client";
import { motion, Transition } from "framer-motion";
import React from "react";
import { cn } from "./lib/utils";

export const LoaderOne = ({ className }: { className?: string }) => {
  const createTransition = (x: number): Transition => {
    return {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: x * 0.2,
      ease: "easeInOut",
    };
  };
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ y: 0 }}
          animate={{ y: [0, 10, 0] }}
          transition={createTransition(i)}
          className="h-4 w-4 rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300"
        />
      ))}
    </div>
  );
};

export const LoaderTwo = ({ className }: { className?: string }) => {
  const createTransition = (x: number): Transition => {
    return {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: x * 0.2,
      ease: ["easeInOut"],
    };
  };
  return (
    <div className={cn("flex items-center", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          transition={createTransition(i === 0 ? 0 : i === 1 ? 0.4 : 0.8)}
          initial={{ x: 0 }}
          animate={{ x: [0, 20, 0] }}
          className={cn(
            "h-4 w-4 rounded-full bg-neutral-200 shadow-md dark:bg-neutral-500",
            i > 0 && (i === 1 ? "-translate-x-2" : "-translate-x-4")
          )}
        />
      ))}
    </div>
  );
};

export const LoaderThree = ({ className }: { className?: string }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "h-20 w-20 stroke-neutral-500 [--fill-final:var(--color-yellow-300)] [--fill-initial:var(--color-neutral-50)] dark:stroke-neutral-100 dark:[--fill-final:var(--color-yellow-500)] dark:[--fill-initial:var(--color-neutral-800)]",
        className
      )}
    >
      <motion.path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path
        initial={{ pathLength: 0, fill: "var(--fill-initial)" }}
        animate={{ pathLength: 1, fill: "var(--fill-final)" }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"
      />
    </motion.svg>
  );
};

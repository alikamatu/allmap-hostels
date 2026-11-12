"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@repo/ui";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { id: 1, label: "Profile" },
  { id: 2, label: "School" },
  { id: 3, label: "Safety" },
];

export const ProgressBar = ({ currentStep, onStepClick }: ProgressBarProps) => {
  return (
    <div className="flex border-b border-gray-200 mb-6 sm:mb-8 p-1 bg-gray-100 rounded-xl">
      {STEPS.map((step) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isClickable = isCompleted && Boolean(onStepClick);

        return (
          <button
            key={step.id}
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onStepClick?.(step.id)}
            className={cn(
              "flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold transition-all duration-300 rounded-lg flex items-center justify-center gap-1.5",
              isCurrent
                ? "bg-white text-black shadow-sm"
                : isCompleted
                  ? "text-black hover:bg-gray-200 cursor-pointer"
                  : "text-gray-400 cursor-default",
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black flex-shrink-0" />
            ) : (
              <span>{step.id}.</span>
            )}
            <span className="truncate">{step.label}</span>
          </button>
        );
      })}
    </div>
  );
};

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { Button, Input, Text, cn } from "@repo/ui";
import { School, OnboardingData } from "@repo/types";
import { SchoolListSkeleton } from "@/_components/common/ui/PageSkeletons";

interface SchoolSelectionStepProps {
  schools: School[];
  loadingSchools: boolean;
  onFetchSchools: (search: string) => void;
  onNext: () => void;
  onBack: () => void;
  submitOnboarding: (data: Partial<OnboardingData>) => Promise<boolean>;
  initialSchoolId?: string;
  isLoading: boolean;
  onError: (error: string) => void;
}

const formatSchoolLocation = (location?: string) => {
  if (
    !location ||
    location.startsWith("POINT(") ||
    location.startsWith("0101")
  ) {
    return "Main Campus";
  }
  return location;
};

export const SchoolSelectionStep = ({
  schools,
  loadingSchools,
  onFetchSchools,
  onNext,
  onBack,
  submitOnboarding,
  initialSchoolId,
  isLoading,
  onError,
}: SchoolSelectionStepProps) => {
  const [selectedSchool, setSelectedSchool] = useState(initialSchoolId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      onFetchSchools(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialSchoolId) {
      setSelectedSchool(initialSchoolId);
    }
  }, [initialSchoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");

    if (!selectedSchool) {
      onError("Please select your university or college to continue");
      return;
    }

    const success = await submitOnboarding({
      school_id: selectedSchool,
      last_onboarding_step: 3,
    });

    if (success) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="space-y-1"
      >
        <Input
          id="schoolSearch"
          type="text"
          label="Search Your University or College"
          icon={Search}
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSearchChange(e.target.value)
          }
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11 sm:h-12"
          placeholder="Type school name or domain..."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {loadingSchools ? (
          <SchoolListSkeleton />
        ) : schools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-gray-200 rounded-xl bg-gray-50 text-center">
            <GraduationCap className="h-8 w-8 text-gray-400 mb-2" />
            <Text className="text-black font-semibold text-sm">
              {searchQuery
                ? "No matching schools found"
                : "No schools available"}
            </Text>
            <Text variant="sm" className="text-gray-500 mt-1 text-xs">
              {searchQuery
                ? "Try searching with a different keyword"
                : "Please check your connection and try again"}
            </Text>
          </div>
        ) : (
          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
            {schools.map((school) => {
              const isSelected = selectedSchool === school.id;
              return (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => {
                    setSelectedSchool(school.id);
                    onError("");
                  }}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3",
                    isSelected
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-white text-black border-gray-200 hover:border-black hover:bg-gray-50",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-bold truncate",
                        isSelected ? "text-white" : "text-black",
                      )}
                    >
                      {school.name}
                    </p>
                    <p
                      className={cn(
                        "text-xs truncate mt-0.5",
                        isSelected ? "text-gray-300" : "text-gray-500",
                      )}
                    >
                      {school.domain ? `${school.domain} • ` : ""}
                      {formatSchoolLocation(school.location)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border",
                      isSelected
                        ? "border-white bg-white text-black"
                        : "border-gray-300",
                    )}
                  >
                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex flex-col-reverse sm:flex-row gap-3 pt-2"
      >
        <Button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full sm:w-1/3 h-14 border border-gray-200 bg-white hover:bg-gray-50 text-black font-bold transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <Button
          type="submit"
          disabled={!selectedSchool || isLoading}
          className={cn(
            "w-full sm:w-2/3 h-14 text-white font-medium transition-all duration-300 relative overflow-hidden bg-black hover:bg-gray-800",
            (!selectedSchool || isLoading) && "bg-gray-400 opacity-70",
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3 h-4 w-4" />
              <span>Saving school...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span>Continue</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          )}
        </Button>
      </motion.div>
    </form>
  );
};

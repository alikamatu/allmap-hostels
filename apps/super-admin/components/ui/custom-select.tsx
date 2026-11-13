"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface CustomSelectProps<T extends string = string> {
  value: T | "";
  onChange: (value: T | "") => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  menuAlign?: "left" | "right";
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  disabled = false,
  size = "md",
  className = "",
  menuAlign = "left",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        const currentIdx = options.findIndex((o) => o.value === value);
        setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev <= 0 ? options.length - 1 : prev - 1,
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          options[highlightedIndex] &&
          !options[highlightedIndex].disabled
        ) {
          onChange(options[highlightedIndex].value);
          close();
        }
        break;
      case "Tab":
        close();
        break;
    }
  };

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs min-h-[34px]"
      : "px-3.5 py-2.5 text-xs sm:text-[13px] min-h-[40px]";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border bg-white text-left transition-colors ${sizeClasses} ${
          isOpen
            ? "border-[#ff7a00] ring-2 ring-[#ff7a00]/15"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"}`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span
            className={`truncate ${selectedOption ? "text-gray-900 font-medium" : "text-gray-400"}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-gray-400 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[#ff7a00]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 w-full min-w-[180px] rounded-xl border border-gray-200/90 bg-white shadow-lg py-1 max-h-60 overflow-y-auto ${
            menuAlign === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <button
                key={option.value || "__empty__"}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    close();
                  }
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors ${
                  option.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-orange-50/90 text-[#ff7a00] font-medium"
                    : isHighlighted
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {option.icon && (
                    <span className="shrink-0">{option.icon}</span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-[11px] text-gray-400 truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Check size={14} className="shrink-0 text-[#ff7a00]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

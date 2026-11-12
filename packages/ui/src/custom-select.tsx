"use client";

import * as React from "react";
import { ChevronDown, Check, LucideIcon } from "lucide-react";
import { cn } from "./lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  id?: string;
  name?: string;
  label?: string;
  options: CustomSelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  error?: string;
  variant?: "underline" | "pill";
  className?: string;
  menuClassName?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const CustomSelect = React.forwardRef<HTMLDivElement, CustomSelectProps>(
  (
    {
      id,
      name,
      label,
      options,
      value: controlledValue,
      defaultValue = "",
      placeholder = "Select an option",
      required,
      disabled = false,
      icon: Icon,
      error,
      variant = "underline",
      className,
      menuClassName,
      onChange,
      onBlur,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string>(
      controlledValue !== undefined ? controlledValue : defaultValue,
    );
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const isControlled = controlledValue !== undefined;
    const selectedValue = isControlled ? controlledValue : internalValue;

    const selectedOption = React.useMemo(
      () => options.find((opt) => opt.value === selectedValue),
      [options, selectedValue],
    );

    // Sync controlled updates
    React.useEffect(() => {
      if (isControlled) {
        setInternalValue(controlledValue);
      }
    }, [isControlled, controlledValue]);

    // Handle outside clicks to close the dropdown
    React.useEffect(() => {
      const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          if (isOpen) {
            setIsOpen(false);
            onBlur?.();
          }
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("touchstart", handleOutsideClick);
      };
    }, [isOpen, onBlur]);

    // Keyboard navigation (Escape, Enter, Arrows)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }

        const enabledOptions = options.filter((o) => !o.disabled);
        const currentIndex = enabledOptions.findIndex(
          (o) => o.value === selectedValue,
        );
        let nextIndex = 0;

        if (e.key === "ArrowDown") {
          nextIndex =
            currentIndex < enabledOptions.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : enabledOptions.length - 1;
        }

        const nextOption = enabledOptions[nextIndex];
        if (nextOption) {
          handleSelect(nextOption.value);
        }
      }
    };

    const handleSelect = (optionValue: string) => {
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
      setIsOpen(false);
    };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }
        }}
        className="w-full space-y-1 relative"
      >
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-medium text-black block select-none"
          >
            {label}{" "}
            {required && <span className="text-black font-bold">*</span>}
          </label>
        )}

        {/* Hidden native input for standard form serialization/validation */}
        <input
          type="hidden"
          id={id}
          name={name}
          value={selectedValue}
          required={required}
        />

        {/* Trigger Field */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "relative w-full flex items-center justify-between text-left transition-colors duration-200 outline-none select-none",
            variant === "underline"
              ? "bg-white border-b border-gray-200 focus:border-black rounded-none h-11 sm:h-12 px-0"
              : "bg-white border border-gray-200 hover:border-black focus:border-black rounded-xl h-10 px-3.5 shadow-sm",
            Icon ? (variant === "underline" ? "pl-10" : "pl-9") : "",
            isOpen &&
              (variant === "underline"
                ? "border-black"
                : "border-black ring-1 ring-black/10"),
            disabled && "opacity-50 cursor-not-allowed bg-gray-50",
            error && "border-red-500",
            className,
          )}
        >
          {Icon && (
            <div
              className={cn(
                "absolute flex items-center pointer-events-none text-gray-500",
                variant === "underline" ? "left-0" : "left-3",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}

          <span
            className={cn(
              "text-sm truncate pr-6",
              selectedOption ? "text-black font-normal" : "text-gray-400",
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <span
            className={cn(
              "absolute flex items-center pointer-events-none text-gray-500 transition-transform duration-200",
              variant === "underline" ? "right-0" : "right-3",
            )}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180 text-black",
              )}
            />
          </span>
        </button>

        {/* Customized Menu Popover */}
        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className={cn(
              "absolute z-50 left-0 right-0 mt-1.5",
              "bg-white border border-gray-200/80 rounded-2xl",
              "shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-1.5",
              "max-h-60 overflow-y-auto space-y-0.5",
              "animate-in fade-in-0 zoom-in-95 duration-150 ease-out",
              menuClassName,
            )}
          >
            {options.map((option) => {
              const isSelected = option.value === selectedValue;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    if (!option.disabled) {
                      handleSelect(option.value);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 select-none",
                    isSelected
                      ? "bg-black text-white font-medium shadow-sm"
                      : "text-gray-900 hover:bg-gray-100/80 active:bg-gray-200/70",
                    option.disabled &&
                      "opacity-40 cursor-not-allowed hover:bg-transparent",
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="truncate">{option.label}</span>
                    {option.description && (
                      <span
                        className={cn(
                          "text-xs truncate mt-0.5",
                          isSelected ? "text-gray-300" : "text-gray-500",
                        )}
                      >
                        {option.description}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 flex-shrink-0 text-white ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  },
);

CustomSelect.displayName = "CustomSelect";

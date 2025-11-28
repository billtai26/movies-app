import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

export default function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  id,
  leadingLabel,
  step,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange: (v: string) => void;
  id?: string;
  leadingLabel?: string;
  step?: number;
}) {
  // console.log(`CustomSelect ${id}: value=${value}, options=`, options);

  const handleValueChange = (newValue: string) => {
    // console.log(`CustomSelect ${id}: onChange called with`, newValue);
    onChange(newValue);
  };

  const selectedOption = options.find(o => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : (leadingLabel || placeholder || "-- Chọn --");

  return (
    <Select.Root value={value} onValueChange={handleValueChange}>
      <Select.Trigger
        className="group flex w-full items-center justify-between h-11 px-2 text-sm text-gray-700 bg-transparent border-none rounded-none focus:outline-none focus:ring-0"
        aria-label="Select"
      >
        <div className="flex items-center gap-2 min-w-0">
          {typeof step === 'number' && (
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
              {step}
            </span>
          )}
          <div className="min-w-0">
            <Select.Value placeholder={placeholder || "-- Chọn --"}>
              <span className="block truncate whitespace-nowrap">
                {displayValue}
              </span>
            </Select.Value>
          </div>
        </div>
        <Select.Icon>
          <ChevronDown size={16} className="text-gray-400 group-focus:text-orange-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-[99999] max-h-[300px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:bg-gray-800 dark:border-gray-700 animate-in fade-in-0 zoom-in-95"
          position="popper"
          sideOffset={4}
        >
          {/* Scroll Up Button */}
          <Select.ScrollUpButton className="flex h-8 cursor-pointer items-center justify-center bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
            <ChevronUp size={16} />
          </Select.ScrollUpButton>
          
          <Select.Viewport className="p-1 max-h-[200px] overflow-y-auto scrollbar-thin">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer select-none items-center justify-between rounded-md px-3 py-2.5 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-100 dark:hover:bg-blue-900/20 dark:hover:text-blue-100 focus:bg-blue-50 focus:text-blue-900 dark:focus:bg-blue-900/20 dark:focus:text-blue-100 outline-none transition-colors data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 dark:data-[highlighted]:bg-blue-900/20 dark:data-[highlighted]:text-blue-100"
              >
                <Select.ItemText className="flex-1">{option.label}</Select.ItemText>
                <div className="w-4 h-4 flex items-center justify-center ml-2">
                  {value === option.value ? (
                    <Check size={14} className="text-blue-600 dark:text-blue-400" />
                  ) : null}
                </div>
              </Select.Item>
            ))}
          </Select.Viewport>
          
          {/* Scroll Down Button */}
          <Select.ScrollDownButton className="flex h-8 cursor-pointer items-center justify-center bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors border-t border-gray-100 dark:border-gray-700">
            <ChevronDown size={16} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

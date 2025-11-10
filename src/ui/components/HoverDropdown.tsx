import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

interface DropdownItem {
  label: string;
  to: string;
  description?: string;
}

interface HoverDropdownProps {
  label: string;
  items: DropdownItem[];
  className?: string;
  variant?: "default" | "simple"; // simple: giống menu mẫu, chỉ label, căn giữa
}

export default function HoverDropdown({ label, items, className = "", variant = "default" }: HoverDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // Delay để tránh flicker khi di chuyển chuột
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      {/* Trigger */}
      <div className="flex items-center gap-1 cursor-pointer text-gray-800 hover:text-[#f58a1f] transition">
        <span>{label}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 ${variant === 'simple' ? 'w-72' : 'w-64'} bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn`}>
          <div className="max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className={`${variant === 'simple' ? 'px-6 py-3 text-center' : 'px-4 py-3'} block hover:bg-gray-50 transition-colors group`}
                onClick={() => setIsOpen(false)}
              >
                <div className={`font-medium ${variant === 'simple' ? 'text-gray-800' : 'text-gray-800'} group-hover:text-[#f58a1f] transition`}>
                  {item.label}
                </div>
                {variant === 'default' && item.description && (
                  <div className="text-sm text-gray-500 mt-1">
                    {item.description}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
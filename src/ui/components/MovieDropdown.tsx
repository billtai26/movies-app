import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollection } from "../../lib/mockCrud";
import SidebarMovieCard from "./SidebarMovieCard";

interface MovieDropdownProps {
  label: string;
  className?: string;
}

export default function MovieDropdown({ label, className = "" }: MovieDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Lấy dữ liệu phim từ mockData
  const { rows: movies = [] } = useCollection<any>("movies");
  
  // Lấy phim đang chiếu và sắp chiếu
  const nowPlayingMovies = movies.filter(m => m.status === 'now').slice(0, 4);
  const comingMovies = movies.filter(m => m.status === 'coming').slice(0, 4);

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
        <div className="absolute top-full left-0 mt-2 w-[600px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
          <div className="p-4">
            {/* Phim Đang Chiếu */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
                PHIM ĐANG CHIẾU
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {nowPlayingMovies.map((m) => (
                  <div key={m.id} onClick={() => setIsOpen(false)}>
                    <SidebarMovieCard
                      movie={{ id: m.id, title: m.title, img: m.poster, poster: m.poster, rating: m.rating, ageRating: m.ageRating || "T18" }}
                      size="compact"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Phim Sắp Chiếu */}
            {comingMovies.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
                  PHIM SẮP CHIẾU
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {comingMovies.map((m) => (
                    <div key={m.id} onClick={() => setIsOpen(false)}>
                      <SidebarMovieCard
                        movie={{ id: m.id, title: m.title, img: m.poster, poster: m.poster, rating: m.rating, ageRating: m.ageRating || "T18" }}
                        size="compact"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer links */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
              <Link
                to="/movies?tab=now"
                className="text-sm text-[#f58a1f] hover:underline font-medium"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả phim đang chiếu →
              </Link>
              <Link
                to="/movies?tab=coming"
                className="text-sm text-[#f58a1f] hover:underline font-medium"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả phim sắp chiếu →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";

type MovieMini = {
  id: string | number;
  name?: string;
  title?: string;
  img: string;
  poster?: string;
  rating?: string | number; // numeric score e.g. 8.3
  ageRating?: string; // e.g. T18, C16
};

export default function SidebarMovieCard({ movie, size = "default", styleHeight }: { movie: MovieMini; size?: "default" | "compact" | "large"; styleHeight?: string }) {
  const title = movie.title || movie.name || "Phim";
  const poster = movie.poster || movie.img;
  const age = movie.ageRating || "T18";
  const imdb = typeof movie.rating === "number"
    ? movie.rating.toFixed(1)
    : typeof movie.rating === "string" && movie.rating
      ? movie.rating
      : "8.3";

  return (
    <Link to={`/movies/${movie.id}`} className="block">
      <div
        className={`relative rounded-lg overflow-hidden w-full ${
          size === "compact" ? "h-36" : size === "large" ? "h-72 md:h-80" : "h-44 md:h-48"
        }`}
        style={styleHeight ? { height: styleHeight } : undefined}
      >
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Top-right rating badge */}
        <div className="absolute top-2 right-2">
          <div className="bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <span>⭐</span>
            <span>{imdb}</span>
          </div>
        </div>

        {/* Bottom-right age badge */}
        <div className="absolute bottom-2 right-2">
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            {age}
          </span>
        </div>
      </div>
      <p className={`mt-2 text-sm text-gray-700 line-clamp-2 ${size === "compact" ? "text-xs" : size === "large" ? "text-lg" : ""}`}>{title}</p>
    </Link>
  );
}
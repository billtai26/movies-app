import React from "react";
import { Link } from "react-router-dom";
import { Play, Ticket } from "lucide-react";

type Movie = {
  _id: string;
  title: string;
  posterUrl: string;
  averageRating?: string;
  ageRating?: string;
};

export default function MovieCard({ movie }: { movie: Movie }) {
  // const imdb = (Math.random() * 2 + 7).toFixed(1);
  return (
    <div className="group">
      <div className="relative rounded-lg overflow-hidden">
        <Link to={`/movies/${movie._id}`} className="block">
          <img
            src={movie?.posterUrl}
            alt={movie.title}
            className="w-full h-[320px] sm:h-[360px] md:h-[400px] lg:h-[420px] xl:h-[440px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Hover Overlay với nút hành động */}
        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Link
              to={`/movies/${movie._id}`}
              className="inline-flex items-center justify-center gap-2 bg-[#f58a1f] text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-[#f26b38] w-40 h-10 text-sm"
            >
              <Ticket size={18} />
              <span>Mua vé</span>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                const url = (movie as any)?.trailer;
                if (url) window.open(url, "_blank");
                else window.open(`/movies/${movie._id}`, "_self");
              }}
              className="inline-flex items-center justify-center gap-2 border border-white/80 bg-white/10 text-white px-4 py-2 rounded-md font-semibold hover:bg-white/20 w-40 h-10 text-sm"
            >
              <Play size={18} />
              <span>Trailer</span>
            </button>
          </div>
        </div>

        {/* IMDb Rating - Top Left */}
        <div className="absolute top-2 left-2">
          <div className="bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <span>⭐</span>
            <span>{movie?.averageRating}</span>
          </div>
        </div>

        {/* Age Rating - Bottom Right */}
        <div className="absolute bottom-2 right-2">
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            {movie?.ageRating || "T18"}
          </span>
        </div>
      </div>

      {/* Tiêu đề nằm ngoài khung ảnh */}
      <Link to={`/movies/${movie._id}`} className="block mt-2">
        <h3 className="font-bold text-base text-gray-900 line-clamp-2 min-h-[2.25rem]">
          {movie?.title}
        </h3>
      </Link>
    </div>
  );
}
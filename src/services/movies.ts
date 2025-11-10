// client/src/services/movies.ts
import { MOVIES_API } from "../lib/api";

export type Movie = {
  _id?: string;
  title: string;
  overview?: string;
  genres?: string[];
  runtime?: number;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  releaseDate?: string; // ISO
  language?: string;
  cast?: string[];
  director?: string;
  ageRating?: string;
  status?: "coming" | "showing" | "ended";
  rating?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function listMovies(params?: { keyword?: string; page?: number; limit?: number; sort?: string }) {
  const q = new URLSearchParams({
    keyword: params?.keyword ?? "",
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
    sort: params?.sort ?? "-createdAt",
  });
  const res = await fetch(`${MOVIES_API}?${q}`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json() as Promise<{ data: Movie[]; pagination: { page: number; limit: number; total: number; pages: number } }>;
}

export async function getMovie(id: string) {
  const res = await fetch(`${MOVIES_API}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json() as Promise<Movie>;
}

export async function createMovie(payload: Movie) {
  const res = await fetch(MOVIES_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error("Failed to create movie");
  return res.json() as Promise<Movie>;
}

export async function updateMovie(id: string, payload: Partial<Movie>) {
  const res = await fetch(`${MOVIES_API}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error("Failed to update movie");
  return res.json() as Promise<Movie>;
}

export async function deleteMovie(id: string) {
  const res = await fetch(`${MOVIES_API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete movie");
  return res.json() as Promise<{ message: string; id: string }>;
}

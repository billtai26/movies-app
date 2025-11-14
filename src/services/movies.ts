// client/src/services/movies.ts
import { BASE_URL } from "../lib/config";

export const MOVIES_API = `${BASE_URL}/api/movies`;

export interface Movie {
  _id?: string;
  title: string;
  description?: string;
  duration?: number;
  poster?: string;
  genre?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export async function listMovies() {
  const res = await fetch(MOVIES_API);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json() as Promise<Movie[]>;
}

export async function getMovie(id: string) {
  const res = await fetch(`${MOVIES_API}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json() as Promise<Movie>;
}

export async function createMovie(payload: Movie) {
  const res = await fetch(MOVIES_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create movie");
  return res.json() as Promise<Movie>;
}

export async function updateMovie(id: string, payload: Partial<Movie>) {
  const res = await fetch(`${MOVIES_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update movie");
  return res.json() as Promise<Movie>;
}

export async function deleteMovie(id: string) {
  const res = await fetch(`${MOVIES_API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete movie");
  return res.json() as Promise<{ message: string }>;
}

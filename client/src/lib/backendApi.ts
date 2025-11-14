// src/lib/backendApi.ts
import axios from "axios";
import { BASE_URL } from "./config";

// === Helper: call API with safe error handling ===
async function safeRequest<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const res = await promise;
    return (res.data as any)?.data ?? res.data;
  } catch (err: any) {
    console.error("❌ API Error:", err?.response?.status, err?.response?.data || err.message);
    throw new Error(err?.response?.data?.message || "Server error");
  }
}

// === API Object ===
export const api = {
  // 🎬 Movies
  async listMovies() {
    return safeRequest(axios.get(`${BASE_URL}/api/movies`));
  },
  async getMovie(id: string) {
    return safeRequest(axios.get(`${BASE_URL}/api/movies/${id}`));
  },

  // 🎭 Genres
  async listGenres() {
    return safeRequest(axios.get(`${BASE_URL}/api/genres`));
  },

  // 🏢 Theaters
  async listTheaters() {
    return safeRequest(axios.get(`${BASE_URL}/api/theaters`));
  },

  // 💺 Rooms / Seats
  async listRoomsSeats() {
    return safeRequest(axios.get(`${BASE_URL}/api/roomsseats`));
  },

  // 🕒 Showtimes
  async listShowtimes() {
    return safeRequest(axios.get(`${BASE_URL}/api/showtimes`));
  },
  async getShowtime(id: string) {
    return safeRequest(axios.get(`${BASE_URL}/api/showtimes/${id}`));
  },

  // 🍿 Combos
  async listCombos() {
    return safeRequest(axios.get(`${BASE_URL}/api/combos`));
  },

  // 👤 Users
  async listUsers() {
    return safeRequest(axios.get(`${BASE_URL}/api/users`));
  },

  // 🎟 Tickets
  async listTickets() {
    return safeRequest(axios.get(`${BASE_URL}/api/tickets`));
  },

  // 💸 Vouchers
  async listVouchers() {
    return safeRequest(axios.get(`${BASE_URL}/api/vouchers`));
  },

  // === GENERIC CRUD (Admin uses this) ===
  async create<T>(collection: string, item: T) {
    return safeRequest(axios.post(`${BASE_URL}/api/${collection}`, item));
  },

  async update<T>(collection: string, id: string, item: T) {
    return safeRequest(axios.put(`${BASE_URL}/api/${collection}/${id}`, item));
  },

  async remove(collection: string, id: string) {
    return safeRequest(axios.delete(`${BASE_URL}/api/${collection}/${id}`));
  },

  // === Generic GET ===
  async getAll(collection: string) {
    return safeRequest(axios.get(`${BASE_URL}/api/${collection}`));
  },

  async getOne(collection: string, id: string) {
    return safeRequest(axios.get(`${BASE_URL}/api/${collection}/${id}`));
  },

  // Dùng tên khác tránh trùng create()
  async createItem(collection: string, data: any) {
    return safeRequest(axios.post(`${BASE_URL}/api/${collection}`, data));
  },
};

import axios from "axios";

// === BASE URL ===
export const BASE_URL =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:8017/api";

// === Helper: call API with safe error handling ===
async function safeRequest<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const res = await promise;
    // Nếu backend trả { data: [...] } thì lấy ra, còn trả raw thì giữ nguyên
    return (res.data as any)?.data ?? res.data;
  } catch (err: any) {
    console.error("❌ API Error:", err?.response?.status, err?.response?.data || err.message);
    throw new Error(err?.response?.data?.message || "Server error");
  }
}

// === API Object ===
export const api = {
  // 🎬 Movies
  async listMovies(status?: "now" | "coming") {
    return safeRequest(axios.get(`${BASE_URL}/movies`, { params: { status } }));
  },
  async getMovie(id: string) {
    return safeRequest(axios.get(`${BASE_URL}/movies/${id}`));
  },

  // 🎭 Theaters
  async listTheaters() {
    return safeRequest(axios.get(`${BASE_URL}/theaters`));
  },

  // 💺 Rooms
  async listRooms(theaterId?: string) {
    return safeRequest(axios.get(`${BASE_URL}/rooms`, { params: { theaterId } }));
  },

  // 🕒 Showtimes
  async listShowtimes() {
    return safeRequest(axios.get(`${BASE_URL}/showtimes`));
  },
  async listShowtimesByMovie(movieId: string) {
    return safeRequest(axios.get(`${BASE_URL}/showtimes`, { params: { movieId } }));
  },
  async getShowtime(id: string) {
    return safeRequest(axios.get(`${BASE_URL}/showtimes/${id}`));
  },

  // 🍿 Combos
  async listCombos() {
    return safeRequest(axios.get(`${BASE_URL}/combos`));
  },

  // 👤 Users
  async listUsers() {
    return safeRequest(axios.get(`${BASE_URL}/users`));
  },

  // 🎟️ Promos
  async listPromos() {
    return safeRequest(axios.get(`${BASE_URL}/promos`));
  },

  // 📰 Articles
  async listArticles() {
    return safeRequest(axios.get(`${BASE_URL}/articles`));
  },

  // === CRUD generic ===
  async create<T>(collection: string, item: T) {
    return safeRequest(axios.post(`${BASE_URL}/${collection}`, item));
  },
  async update<T>(collection: string, id: string, item: T) {
    return safeRequest(axios.put(`${BASE_URL}/${collection}/${id}`, item));
  },
  async remove(collection: string, id: string) {
    return safeRequest(axios.delete(`${BASE_URL}/${collection}/${id}`));
  },

  // === Generic GET ===
  async getAll(collection: string) {
    return safeRequest(axios.get(`${BASE_URL}/${collection}`));
  },
  async getOne(collection: string, id: string) {
    return safeRequest(axios.get(`${BASE_URL}/${collection}/${id}`));
  },
  // Dùng name khác tránh trùng create()
  async createItem(collection: string, data: any) {
    return safeRequest(axios.post(`${BASE_URL}/${collection}`, data));
  },
};

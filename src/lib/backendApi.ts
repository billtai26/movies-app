import axios from 'axios'
import { BASE_URL } from './config'

// --- THÊM HÀM TRỢ GIÚP NÀY ---
// Hàm này đọc token từ localStorage.
// 'auth-storage' là tên (name) mặc định mà bạn có thể đã đặt trong store/auth.ts
const getAuthToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage'); 
    if (authStorage) {
      const authState = JSON.parse(authStorage);
      return authState.state?.token || null;
    }
  } catch (error) {
    console.error("Failed to parse auth token from localStorage", error);
  }
  return null;
}

export const api = {
  // Đảm bảo hàm listMovies của bạn trông như thế này
  // Sửa lại type của params trong hàm listMovies
  async listMovies(params?: { 
    status?: 'now_showing' | 'coming_soon'; 
    limit?: number; 
    page?: number;
    q?: string; // <-- THÊM DÒNG NÀY
  }) {
    const res = await axios.get(`${BASE_URL}/movies`, { params })
    return res.data
  },
  async getMovie(id: string) {
    const res = await axios.get(`${BASE_URL}/movies/${id}`)
    return res.data
  },
  async listTheaters() {
    const res = await axios.get(`${BASE_URL}/theaters`)
    return res.data
  },
  async listRooms(theaterId?: string) {
    const res = await axios.get(`${BASE_URL}/rooms`, { params: { theaterId } })
    return res.data
  },
  async listShowtimes() {
    const res = await axios.get(`${BASE_URL}/showtimes`)
    return res.data
  },
  async listShowtimesByMovie(movieId: string) {
    const res = await axios.get(`${BASE_URL}/showtimes`, { params: { movieId } })
    return res.data
  },
  async getShowtime(id: string) {
    const res = await axios.get(`${BASE_URL}/showtimes/${id}`)
    return res.data
  },
  async listCombos() {
    const res = await axios.get(`${BASE_URL}/combos`)
    return res.data
  },
  async listUsers() {
    const res = await axios.get(`${BASE_URL}/users`)
    return res.data
  },
  async listPromos() {
    const res = await axios.get(`${BASE_URL}/promos`)
    return res.data
  },
  async listArticles() {
    const res = await axios.get(`${BASE_URL}/articles`)
    return res.data
  },
   // --- CẬP NHẬT CÁC HÀM NÀY ĐỂ GỬI TOKEN ---
  async create<T>(collection: string, item: T) {
    const token = getAuthToken();
    const res = await axios.post(`${BASE_URL}/${collection}`, item, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },
  async update<T>(collection: string, id: string, item: T) {
    const token = getAuthToken();
    const res = await axios.put(`${BASE_URL}/${collection}/${id}`, item, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },
  async remove(collection: string, id: string) {
    const token = getAuthToken();
    const res = await axios.delete(`${BASE_URL}/${collection}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },

  // --- THÊM HÀM MỚI CHO VOUCHER ---
  async applyVoucher(code: string, total: number) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để áp dụng voucher');
    }
    // Backend API mong đợi { code, total } [cite: billtai26/movies-app-api/movies-app-api-446f3ccb9864f33c173747ed5d471269754b54bc/src/validations/voucherValidation.js]
    const res = await axios.post(`${BASE_URL}/vouchers/apply`, 
      { code, total },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    // API trả về { discountAmount, finalAmount, message } [cite: billtai26/movies-app-api/movies-app-api-446f3ccb9864f33c173747ed5d471269754b54bc/src/services/voucherService.js]
    return res.data; 
  },
}

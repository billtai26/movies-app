import axios from 'axios'
import { BASE_URL, AUTH_ENDPOINTS } from './config'

// --- THÊM HÀM TRỢ GIÚP NÀY ---
// Hàm này đọc token từ localStorage.
// 'auth-storage' là tên (name) mặc định mà bạn có thể đã đặt trong store/auth.ts
const getAuthToken = () => {
  try {
    // Support both keys: our store persists at 'auth'
    const rawAuth = localStorage.getItem('auth')
    if (rawAuth) {
      const st = JSON.parse(rawAuth)
      return st?.token || null
    }
    const legacy = localStorage.getItem('auth-storage')
    if (legacy) {
      const st2 = JSON.parse(legacy)
      return st2.state?.token || null
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
    const res = await axios.get(`${BASE_URL}/cinemas`)
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
  async listShowtimesByMovie(movieId: string, cinemaId?: string) {
    const res = await axios.get(`${BASE_URL}/showtimes`, { params: { movieId, cinemaId } })
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
  async listComments(movieId?: string) {
    const res = await axios.get(`${BASE_URL}/comments`, movieId ? { params: { movieId } } : undefined)
    return res.data
  },
   // --- CẬP NHẬT CÁC HÀM NÀY ĐỂ GỬI TOKEN ---
  async create<T>(collection: string, item: T) {
    const token = getAuthToken();
    const res = await axios.post(`${BASE_URL}/${collection}`, item, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return res.data
  },
  async update<T>(collection: string, id: string, item: T) {
    const token = getAuthToken();
    const res = await axios.put(`${BASE_URL}/${collection}/${id}`, item, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return res.data
  },
  async remove(collection: string, id: string) {
    const token = getAuthToken();
    const res = await axios.delete(`${BASE_URL}/${collection}/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
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
  async login(email: string, password: string){
    // 1. Chỉ lấy 1 endpoint
    const path = AUTH_ENDPOINTS.login[0]
    if (!path) {
      throw new Error('Login endpoint not configured')
    }

    const url = `${BASE_URL}${path}`
    const payload = { email, password } // Backend mong đợi JSON {email, password}

    try {
      // 2. GỌI API 1 LẦN DUY NHẤT bằng JSON
      //    Bỏ qua cách gửi "form-urlencoded" rắc rối
      const res = await axios.post(url, payload)
      
      // 3. Thành công thì trả về data
      return res.data
    } catch (err: any) {
      // 4. THẤT BẠI thì ném lỗi ra ngoài
      //    để LoginModal.tsx bắt được
      console.error('Lỗi khi gọi API đăng nhập:', err.response?.data || err.message)
      throw err
    }
  },
  async register(payload: { username: string; email: string; password: string }){
    // 1. Đảm bảo signature của hàm có 'username' (như bạn đã sửa)

    // 2. Chúng ta sẽ không dùng vòng lặp 'for' nữa,
    //    chỉ gọi 1 endpoint duy nhất bằng JSON.
    const path = AUTH_ENDPOINTS.register[0] // Lấy endpoint đầu tiên
    if (!path) {
      throw new Error('Register endpoint not configured')
    }

    const url = `${BASE_URL}${path}`

    try {
      // 3. Gọi API 1 LẦN DUY NHẤT bằng JSON
      //    (axios mặc định gửi JSON)
      const res = await axios.post(url, payload as any)
      
      // 4. Thành công thì trả về data
      return res.data
    } catch (err: any) {
      // 5. Nếu THẤT BẠI, ném lỗi ra ngoài.
      //    Lỗi này sẽ được bắt bởi try...catch trong RegisterModal.tsx
      console.error('Lỗi khi gọi API đăng ký:', err.response?.data || err.message)
      throw err // Ném lỗi này ra để modal bắt được
    }
  },
  async requestPasswordReset(email: string){
    // 1. Chỉ lấy 1 endpoint
    const path = AUTH_ENDPOINTS.forgotPassword[0]
    if (!path) {
      throw new Error('Forgot password endpoint not configured')
    }

    const url = `${BASE_URL}${path}`
    const payload = { email } // Backend validation mong đợi {email}

    try {
      // 2. GỌI API 1 LẦN DUY NHẤT bằng JSON
      const res = await axios.post(url, payload)
      
      // 3. Thành công thì trả về data
      return res.data
    } catch (err: any) {
      // 4. THẤT BẠI thì ném lỗi ra ngoài
      //    để ForgotPasswordModal.tsx bắt được
      console.error('Lỗi khi gọi API quên mật khẩu:', err.response?.data || err.message)
      throw err
    }
  },
  // --- THÊM HÀM MỚI NÀY VÀO ---
  async resetPassword(token: string, password: string) {
    const url = `${BASE_URL}/users/reset-password`
    const payload = { token, password }
    const res = await axios.put(url, payload)
    return res.data
  },
}

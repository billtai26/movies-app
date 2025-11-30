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
    const res = await axios.get(`${BASE_URL}/cinemahalls`, { params: { theaterId } })
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
  // Backend trả về { combos: [], pagination: {} } nên ta cần gọi đúng endpoint
  async listCombos() {
    // Endpoint này khớp với Router.route('/') trong comboRoute.js
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
    const token = getAuthToken();
    const cfg: any = {};
    if (token) cfg.headers = { Authorization: `Bearer ${token}` };
    const url = movieId ? `${BASE_URL}/comments/movie/${movieId}` : `${BASE_URL}/comments`
    const res = await axios.get(url, cfg)
    return res.data
  },
   // --- CẬP NHẬT CÁC HÀM NÀY ĐỂ GỬI TOKEN ---
  async create<T>(collection: string, item: T) {
    const token = getAuthToken();
    const url = collection === 'comments' ? `${BASE_URL}/comments` : `${BASE_URL}/${collection}`
    const payload = collection === 'comments' ? ({
      movieId: (item as any)?.movieId,
      content: (item as any)?.content,
      parentId: (item as any)?.parentId ?? null
    }) : item
    const res = await axios.post(url, payload, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return res.data
  },
  async update<T>(collection: string, id: string, item: T) {
    const token = getAuthToken();
    const url = collection === 'comments' ? `${BASE_URL}/comments/${id}` : `${BASE_URL}/${collection}/${id}`
    const res = await axios.put(url, item, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return res.data
  },
  async remove(collection: string, id: string) {
    const token = getAuthToken();
    const url = collection === 'comments' ? `${BASE_URL}/comments/${id}` : `${BASE_URL}/${collection}/${id}`
    const res = await axios.delete(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
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
  async listTickets(params?: { page?: number; limit?: number }){
    const token = getAuthToken();
    const cfg: any = {};
    if (params) cfg.params = params;
    if (token) cfg.headers = { Authorization: `Bearer ${token}` };
    const res = await axios.get(`${BASE_URL}/tickets`, cfg)
    return res.data
  },
  async getTicket(id: string){
    const token = getAuthToken();
    const cfg: any = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const res = await axios.get(`${BASE_URL}/tickets/${id}`, cfg)
    return res.data
  },
  // 1. Lấy thông tin cá nhân (GET /v1/users/profile)
  async getProfile() {
    const token = getAuthToken();
    if (!token) return null;
    const res = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // 2. Cập nhật thông tin text (PUT /v1/users/profile)
  async updateProfileUser(data: { username?: string; phone?: string; dob?: string }) {
    const token = getAuthToken();
    const res = await axios.put(`${BASE_URL}/users/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // 3. Upload Avatar (PATCH /v1/users/profile/avatar)
  async updateAvatarUser(file: File) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('avatar', file); // Key phải là 'avatar' trùng với upload.single('avatar') bên backend

    const res = await axios.patch(`${BASE_URL}/users/profile/avatar`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    return res.data;
  },
  /**
   * HÀM MỚI: Gọi API để giữ ghế
   * @param showtimeId ID của suất chiếu
   * @param seatNumbers Mảng các số ghế (ví dụ: ['A1', 'A2'])
   */
  async holdSeats(showtimeId: string, seatNumbers: string[]) {
    const token = getAuthToken(); // Hàm này đã có sẵn trong file backendApi.ts của bạn
    if (!token) {
      throw new Error('Vui lòng đăng nhập để chọn ghế.');
    }

    // Gọi đúng endpoint đã định nghĩa trong showtimeRoute.js
    const res = await axios.post(
      `${BASE_URL}/showtimes/${showtimeId}/hold-seats`,
      { seatNumbers }, // Payload match với req.body.seatNumbers trong controller
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },
  async releaseSeats(showtimeId: string, seatNumbers: string[]) {
    const token = getAuthToken();
    if (!token) return;
    await axios.post(
      `${BASE_URL}/showtimes/${showtimeId}/release-seats`,
      { seatNumbers },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

   // ================= AI CHAT =================
  async aiHistory(userId: string) {
    const res = await axios.get(`${BASE_URL}/ai/history`, {
      params: { userId }
    });
    return res.data; // mảng [{role, content}]
  },

  async aiChat(userId: string | null, message: string) {
    const res = await axios.post(`${BASE_URL}/ai/chat`, {
      userId,
      message
    });
    return res.data; // { reply: string }
  },
     // 🔥 MoMo QR Payment
momoCreate: async (data: any) => {
  const token = getAuthToken();

  const res = await axios.post(
    // ĐÚNG: /v1/payments/momo/payment
    `${BASE_URL}/payments/momo/payment`,
    data,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined
    }
  );

  // BE trả về { success, data: {...} }
  // => trả thẳng data bên trong cho Payment.tsx
  return res.data?.data || res.data;
},

  momoConfirm: async (params: any) => {
  // Thường callback từ MoMo không cần token, nhưng có cũng không sao
  const token = getAuthToken();

  const res = await axios.post(
    `${BASE_URL}/payments/momo/callback`,
    params,
    token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined
  );

  // BE trả về { ... , invoice }
  return res.data;
},

}


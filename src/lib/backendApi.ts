import axios from 'axios'
import { BASE_URL, AUTH_ENDPOINTS } from './config'

// Helper: Lấy token từ localStorage
const getAuthToken = () => {
  try {
    const rawAuth = localStorage.getItem('auth')
    if (rawAuth) {
      const st = JSON.parse(rawAuth)
      return st?.token || null
    }
  } catch (error) {
    console.error("Failed to parse auth token", error);
  }
  return null;
}

// Helper: Tạo header chứa Token
const getHeader = () => {
  const token = getAuthToken()
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

export const api = {
  // =================================================================
  // 1. CÁC HÀM GET CỤ THỂ (Dùng cho các trang riêng lẻ)
  // =================================================================
  
  async listMovies(params?: any) {
    // Backend: GET /movies
    const res = await axios.get(`${BASE_URL}/movies`, { params })
    return res.data
  },
  
  async getMovie(id: string) {
    const res = await axios.get(`${BASE_URL}/movies/${id}`)
    return res.data
  },

  async listTheaters() {
    // Backend: GET /cinemas
    const res = await axios.get(`${BASE_URL}/cinemas`) 
    return res.data
  },

  async listRooms(params?: any) {
    // Backend: GET /cinemahalls
    const res = await axios.get(`${BASE_URL}/cinemahalls`, { params }) 
    return res.data
  },

  async listShowtimes() {
    // Backend: GET /showtimes
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

  // SỬA HÀM listCombos (hoặc để nguyên dùng cho user, ta sửa trong hàm list bên dưới)
  async listCombos() {
    const res = await axios.get(`${BASE_URL}/combos`) // No Header
    return res.data
  },

  async listUsers(params?: any) {
    const res = await axios.get(`${BASE_URL}/users`, { params, ...getHeader() })
    return res.data
  },

  async listPromos() {
    // Backend: GET /vouchers/admin (Dành cho Admin/Staff quản lý)
    const res = await axios.get(`${BASE_URL}/vouchers/admin`, getHeader())
    return res.data
  },

  async listComments(movieId?: string) {
    const url = movieId ? `${BASE_URL}/comments/movie/${movieId}` : `${BASE_URL}/comments`
    const res = await axios.get(url, getHeader())
    return res.data
  },

  async listBookings(params?: any){
    // Backend: GET /bookings
    const res = await axios.get(`${BASE_URL}/bookings`, { params, ...getHeader() })
    return res.data
  },

  async getTicket(id: string){
    const res = await axios.get(`${BASE_URL}/bookings/${id}`, getHeader())
    return res.data
  },
  
  async listStaffReports() {
    // Backend: GET /submissions/admin
    const res = await axios.get(`${BASE_URL}/submissions/admin`, getHeader());
    return res.data;
  },

  // =================================================================
  // 2. HÀM GENERIC CHO CRUD TABLE (QUAN TRỌNG NHẤT)
  // =================================================================
  
  async list(collection: string, params?: any) {
    // --- MAPPING TÊN COLLECTION SANG HÀM GET TƯƠNG ỨNG ---
    
    // 1. Phim & Người dùng
    if (collection === 'movies') return this.listMovies(params);
    if (collection === 'users') return this.listUsers(params);
    if (collection === 'comments') return this.listComments();
    if (collection === 'combos') return this.listCombos();

    // 2. Rạp & Phòng (Frontend gọi 'theaters', 'rooms' -> Backend 'cinemas', 'cinemahalls')
    if (collection === 'theaters') return this.listTheaters();
    if (collection === 'cinemaHalls' || collection === 'rooms') return this.listRooms(params);
    // Map tên collection từ UI sang endpoint của Backend
    if (collection === 'movies') return this.listMovies(params);
    if (collection === 'users') return this.listUsers(params);
    if (collection === 'theaters') return this.listTheaters();
    if (collection === 'cinemaHalls') return this.listRooms(params);
    if (collection === 'showtimes') {
       const data = await this.listShowtimes();
       return (data as any).showtimes || data;
    }
    
    // Map các endpoint Staff mới
    // Thêm block xử lý riêng cho combos (giống vouchers)
    if (collection === 'combos') {
        // Gọi endpoint Admin List để lấy đầy đủ dữ liệu
        const res = await axios.get(`${BASE_URL}/combos/admin/list`, getHeader());
        return res.data;
    }
    if (collection === 'staff-reports') return this.listStaffReports();
    if (collection === 'orders') return this.listOrders(params);
    if (collection === 'tickets') return this.listTickets(params);
    
    // 3. Lịch chiếu
    if (collection === 'showtimes') {
       const data = await this.listShowtimes();
       // Đôi khi BE trả về { showtimes: [...] } hoặc mảng trực tiếp
       return (data as any).showtimes || data;
    }

    // 4. Khuyến mãi (Frontend 'promotions' -> Backend 'vouchers')
    if (collection === 'promotions' || collection === 'vouchers') return this.listPromos();
    
    // 5. Báo cáo (Frontend 'staff-reports' -> Backend 'submissions')
    if (collection === 'staff-reports') return this.listStaffReports();
    
    // 6. Đơn hàng & Vé (Frontend 'orders', 'tickets' -> Backend 'bookings')
    if (collection === 'orders' || collection === 'tickets') return this.listBookings(params);
    
    // --- MẶC ĐỊNH: Nếu không nằm trong danh sách trên, gọi thẳng tên collection ---
    try {
      const res = await axios.get(`${BASE_URL}/${collection}`, { params, ...getHeader() });
      return res.data;
    } catch (error) {
      console.error(`Error listing ${collection}`, error);
      return [];
    }
  },

  // =================================================================
  // 3. HÀM CREATE (TẠO MỚI)
  // =================================================================

  async create<T>(collection: string, item: T) {
    let endpoint = collection;
    
    // --- MAPPING ENDPOINT ---
    if (collection === 'staff-reports') endpoint = 'submissions'; // POST /submissions (Public/AuthOptional)
    if (collection === 'promotions') endpoint = 'vouchers/admin'; // POST /vouchers/admin
    if (collection === 'theaters') endpoint = 'cinemas';          // POST /cinemas
    if (collection === 'cinemaHalls') endpoint = 'cinemahalls';   // POST /cinemahalls
    if (collection === 'tickets') endpoint = 'bookings';          // POST /bookings

    // Xử lý riêng cho Movies (convert số & mảng)
    if (collection === 'movies') {
       const raw = item as any;
       const payload = {
         ...raw,
         durationInMinutes: Number(raw.durationInMinutes),
         // Chuyển chuỗi "Hành động, Hài" thành mảng ["Hành động", "Hài"]
         genres: typeof raw.genres === 'string' ? raw.genres.split(',').map((g:string)=>g.trim()) : raw.genres,
       };
       // Xóa các trường thừa
       delete (payload as any).duration; 
       delete (payload as any).rating;
       
       const res = await axios.post(`${BASE_URL}/movies`, payload, getHeader());
       return res.data;
    }

    const res = await axios.post(`${BASE_URL}/${endpoint}`, item, getHeader());
    return res.data;
  },

  // =================================================================
  // 4. HÀM UPDATE (CẬP NHẬT)
  // =================================================================

  async update<T>(collection: string, id: string, item: T) {
    let endpoint = collection;

    // --- MAPPING ENDPOINT ---
    if (collection === 'theaters') endpoint = 'cinemas';
    if (collection === 'cinemaHalls') endpoint = 'cinemahalls';
    if (collection === 'promotions') endpoint = 'vouchers/admin'; // PATCH /vouchers/admin/:id
    if (collection === 'staff-reports') endpoint = 'submissions/admin'; // PATCH /submissions/admin/:id
    if (collection === 'orders' || collection === 'tickets') endpoint = 'bookings';

    const payload = { ...item } as any;
    // Loại bỏ các trường không nên gửi lên khi update
    ['_id', 'createdAt', 'updatedAt', 'slug'].forEach(k => delete payload[k]);

    // Xử lý riêng User: Không gửi password nếu rỗng
    if (collection === 'users') {
        delete payload.email; // Không cho sửa email
        if (!payload.password) delete payload.password;
    }

    // Backend RESTful thường dùng PATCH để update một phần
    // Một số endpoint đặc biệt dùng PUT thì có thể check ở đây, nhưng PATCH an toàn hơn.
    const method = 'patch'; 

    const res = await (axios as any)[method](`${BASE_URL}/${endpoint}/${id}`, payload, getHeader());
    return res.data;
  },

  // =================================================================
  // 5. HÀM REMOVE (XÓA)
  // =================================================================

  async remove(collection: string, id: string) {
    let endpoint = collection;
    
    // --- MAPPING ENDPOINT ---
    if (collection === 'theaters') endpoint = 'cinemas';
    if (collection === 'staff-reports') endpoint = 'submissions/admin';
    if (collection === 'promotions') endpoint = 'vouchers/admin';
    if (collection === 'orders' || collection === 'tickets') endpoint = 'bookings';
    
    const res = await axios.delete(`${BASE_URL}/${endpoint}/${id}`, getHeader());
    return res.data;
  },

  // =================================================================
  // 6. CÁC HÀM TIỆN ÍCH KHÁC (AUTH, PAYMENT, ETC.)
  // =================================================================

  async login(email: string, password: string){
    const res = await axios.post(`${BASE_URL}${AUTH_ENDPOINTS.login[0]}`, { email, password })
    return res.data
  },

  async register(payload: any){
    const res = await axios.post(`${BASE_URL}${AUTH_ENDPOINTS.register[0]}`, payload)
    return res.data
  },

  async requestPasswordReset(email: string){
    const res = await axios.post(`${BASE_URL}${AUTH_ENDPOINTS.forgotPassword[0]}`, { email })
    return res.data
  },

  async resetPassword(token: string, password: string) {
    const res = await axios.put(`${BASE_URL}/users/reset-password/${token}`, { password })
    return res.data
  },

  async getProfile() {
    const res = await axios.get(`${BASE_URL}/users/profile`, getHeader());
    return res.data;
  },

  async updateProfileUser(data: any) {
    const res = await axios.put(`${BASE_URL}/users/profile`, data, getHeader());
    return res.data;
  },

  async updateAvatarUser(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await axios.patch(`${BASE_URL}/users/profile/avatar`, formData, {
      ...getHeader(),
      'Content-Type': 'multipart/form-data',
    } as any);
    return res.data;
  },

  async listMyTickets(params?: any) {
    // Backend: GET /bookings/history
    const res = await axios.get(`${BASE_URL}/bookings/history`, { params, ...getHeader() });
    return res.data;
  },

  async getMyTicket(id: string) {
    // Backend: GET /bookings/:id
    const res = await axios.get(`${BASE_URL}/bookings/${id}`, getHeader());
    return res.data;
  },

  async applyVoucher(code: string, total: number) {
    const res = await axios.post(`${BASE_URL}/vouchers/apply`, { code, total }, getHeader());
    return res.data; 
  },

  async holdSeats(showtimeId: string, seatNumbers: string[]) {
    // Có thể Backend xử lý qua Socket, hàm này để placeholder hoặc gọi API nếu có
    return { success: true }; 
  },

  async releaseSeats(showtimeId: string, seatNumbers: string[]) {
    return { success: true };
  },

  async momoCreate(body: any) {
     // SỬA DÒNG NÀY:
     // Cũ (Sai): `${BASE_URL}/payment/momo`
     // Mới (Đúng): `${BASE_URL}/payments/momo/payment`  <-- Chú ý chữ 'payments' số nhiều và thêm '/payment' ở cuối
     const res = await axios.post(`${BASE_URL}/payments/momo/payment`, body, getHeader());
     return res.data;
  },
  
  // AI Chat (Nếu backend chưa có route này, bạn cần thêm vào BE hoặc comment lại)
  async aiChat(userId: string, message: string) {
      try {
        const res = await axios.post(`${BASE_URL}/ai/chat`, { userId, message });
        return res.data;
      } catch (e) {
        console.warn("AI Chat API not ready");
        return { reply: "AI đang bảo trì." };
      }
  },

  async aiHistory(userId: string) {
      try {
        const res = await axios.get(`${BASE_URL}/ai/history/${userId}`);
        return res.data;
      } catch (e) {
        return [];
      }
  }
}
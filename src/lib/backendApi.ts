import axios from 'axios'
import { BASE_URL, AUTH_ENDPOINTS } from './config'

const getAuthToken = () => {
  try {
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

// Helper tạo config header
const getHeader = () => {
  const token = getAuthToken()
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

export const api = {
  // --- 1. CÁC HÀM GET DỮ LIỆU CỤ THỂ ---
  async listMovies(params?: { status?: 'now_showing' | 'coming_soon'; limit?: number; page?: number; q?: string }) {
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

  async listRooms(params?: any) {
    const res = await axios.get(`${BASE_URL}/cinemahalls`, { params })
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
    const res = await axios.get(`${BASE_URL}/promos`)
    return res.data
  },

  async listArticles() {
    const res = await axios.get(`${BASE_URL}/articles`)
    return res.data
  },

  async listComments(movieId?: string) {
    const url = movieId ? `${BASE_URL}/comments/movie/${movieId}` : `${BASE_URL}/comments`
    const res = await axios.get(url, getHeader())
    return res.data
  },

  async listTickets(params?: { page?: number; limit?: number; q?: string; status?: string }){
    const res = await axios.get(`${BASE_URL}/tickets`, { params, ...getHeader() })
    return res.data
  },

  async getTicket(id: string){
    const res = await axios.get(`${BASE_URL}/tickets/${id}`, getHeader())
    return res.data
  },
  
  // --- [BỔ SUNG TỪ CODE 2] Hàm này Code 1 chưa có ---
  async listBookings(params?: any){
    const res = await axios.get(`${BASE_URL}/bookings`, { params, ...getHeader() })
    return res.data
  },
  // --------------------------------------------------

  // --- [MỚI] API CHO STAFF ---
  async checkInTicket(ticketCode: string) {
    const res = await axios.post(`${BASE_URL}/tickets/check-in`, { code: ticketCode }, getHeader());
    return res.data;
  },

  async listOrders(params?: any) {
    const res = await axios.get(`${BASE_URL}/orders`, { params, ...getHeader() });
    return res.data;
  },

  async listStaffReports() {
    const res = await axios.get(`${BASE_URL}/staff-reports`, getHeader());
    return res.data;
  },
  
  // --- 2. HÀM LIST TỔNG HỢP (QUAN TRỌNG CHO CRUD TABLE) ---
  async list(collection: string, params?: any) {
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
    
    // --- THÊM DÒNG NÀY ---
    // Nếu BE yêu cầu chính xác là /vouchers/admin thì dùng dòng này:
    if (collection === 'vouchers') {
        // Cũ: axios.get(`${BASE_URL}/vouchers`, ...) -> Sai, đây là API User
        
        // Mới: Thêm '/admin' vào đường dẫn
        const res = await axios.get(`${BASE_URL}/vouchers/admin`, { params, ...getHeader() });
        return res.data;
    }
    // ---------------------

    // --- [BỔ SUNG TỪ CODE 2] Xử lý các collection/alias mà code 1 thiếu ---
    if (collection === 'comments') return this.listComments();
    if (collection === 'rooms') return this.listRooms(params); // Code 2 dùng alias 'rooms'
    
    // --- THÊM ĐOẠN NÀY ---
    if (collection === 'notifications') {
        // Gọi đúng API Admin để lấy toàn bộ danh sách
        const res = await axios.get(`${BASE_URL}/notifications/admin`, { params, ...getHeader() });
        return res.data;
    }

    // Code 2 map 'bookings'
    if (collection === 'bookings') return this.listBookings(params);
    // ----------------------------------------------------------------------

    // Mặc định
    try {
      const res = await axios.get(`${BASE_URL}/${collection}`, { params, ...getHeader() });
      return res.data;
    } catch (error) {
      console.error(`Error listing ${collection}`, error);
      return [];
    }
  },

  // --- 3. CÁC HÀM THAO TÁC DỮ LIỆU (CREATE, UPDATE, DELETE) ---

  async uploadMoviePoster(id: string, file: File) {
    const formData = new FormData();
    formData.append('poster', file); 
    const res = await axios.patch(`${BASE_URL}/movies/${id}/poster`, formData, {
      ...getHeader(),
      'Content-Type': 'multipart/form-data',
    } as any);
    return res.data;
  },

  async create<T>(collection: string, item: T) {
    // Xử lý riêng cho Movies (convert dữ liệu)
    if (collection === 'movies') {
       const raw = item as any;
       const payload = {
         ...raw,
         durationInMinutes: Number(raw.durationInMinutes),
         genres: typeof raw.genres === 'string' ? raw.genres.split(',').map((g:string)=>g.trim()) : raw.genres,
         actors: typeof raw.actors === 'string' ? raw.actors.split(',').map((a:string)=>a.trim()) : raw.actors,
         posterUrl: raw.posterUrl, 
       };
       delete (payload as any).duration; 
       delete (payload as any).rating;

       const res = await axios.post(`${BASE_URL}/movies`, payload, getHeader());
       return res.data;
    }

    if (collection === 'vouchers') {
        const raw = item as any;
        const payload = {
            ...raw,
            discountValue: Number(raw.discountValue),
            maxDiscountAmount: raw.maxDiscountAmount ? Number(raw.maxDiscountAmount) : null,
            minOrderAmount: Number(raw.minOrderAmount),
            usageLimit: Number(raw.usageLimit),
            
            // --- SỬA DÒNG NÀY ĐỂ FIX LỖI "expiresAt is required" ---
            // Chuyển đổi ngày sang ISO String chuẩn (ví dụ: 2023-12-01T10:00:00.000Z)
            expiresAt: raw.expiresAt ? new Date(raw.expiresAt).toISOString() : undefined,
        };
        
        // Gọi API admin
        const res = await axios.post(`${BASE_URL}/vouchers/admin`, payload, getHeader());
        return res.data;
    }

    // Mặc định cho các collection khác
    let endpoint = collection;

    // --- THÊM ĐOẠN NÀY ---
    if (collection === 'notifications') {
        endpoint = 'notifications/admin';
    }

    // Map đúng tên endpoint
    if (collection === 'staff-reports') endpoint = 'staff-reports';
    if (collection === 'comments') endpoint = 'comments';

    // --- THÊM: Map vouchers đúng endpoint ---
    if (collection === 'vouchers') endpoint = 'vouchers';

    // --- [BỔ SUNG TỪ CODE 2] Mapping thêm các alias ---
    if (collection === 'promotions') endpoint = 'vouchers/admin';
    if (collection === 'cinemaHalls') endpoint = 'cinemahalls';
    // Code 2 map 'bookings' (hoặc 'tickets' kiểu mới) vào /bookings
    if (collection === 'bookings') endpoint = 'bookings'; 
    // --------------------------------------------------

    const res = await axios.post(`${BASE_URL}/${endpoint}`, item, getHeader());
    return res.data;
  },

  async update<T>(collection: string, id: string, item: T) {
    // Xử lý riêng cho Movies
    if (collection === 'movies') {
       const raw = item as any;
       const payload = {
         ...raw,
         durationInMinutes: Number(raw.durationInMinutes),
         genres: typeof raw.genres === 'string' ? raw.genres.split(',').map((g:string)=>g.trim()) : raw.genres,
         actors: typeof raw.actors === 'string' ? raw.actors.split(',').map((a:string)=>a.trim()) : raw.actors,
       };
       // Cleanup fields
       ['_id', 'duration', 'rating', 'averageRating', 'reviewCount', 'createdAt', 'updatedAt', '_destroy', 'slug'].forEach(k => delete (payload as any)[k]);

       const res = await axios.put(`${BASE_URL}/movies/${id}`, payload, getHeader());
       return res.data;
    }

    // SỬA LẠI KHỐI NÀY
    if (collection === 'vouchers') {
        const raw = item as any;
        const payload = {
            ...raw,
            discountValue: Number(raw.discountValue),
            maxDiscountAmount: raw.maxDiscountAmount ? Number(raw.maxDiscountAmount) : null,
            minOrderAmount: Number(raw.minOrderAmount),
            usageLimit: Number(raw.usageLimit),
            // Format ngày nếu cần
            expiresAt: raw.expiresAt ? new Date(raw.expiresAt).toISOString() : undefined,
        };

        // // 2. THÊM ĐOẠN NÀY: Xóa các trường hệ thống không được phép sửa
        delete payload._id;         // Bắt buộc xóa
        delete payload.code;        // Bạn yêu cầu không cho sửa code
        delete payload._destroy;    // Bạn yêu cầu không cho sửa destroy
        
        delete payload.createdAt;   // Ngày tạo cũng không nên gửi lên
        delete payload.updatedAt;   // (Nếu có)
        delete payload.usageCount;  // Số lượt đã dùng thường do hệ thống tự đếm, không nên sửa tay

        // --- QUAN TRỌNG: Thêm `/${id}` vào cuối URL ---
        // Sai: `${BASE_URL}/vouchers/admin`
        // Đúng: `${BASE_URL}/vouchers/admin/${id}`
        const res = await axios.patch(`${BASE_URL}/vouchers/admin/${id}`, payload, getHeader());
        return res.data;
    }

    // Xử lý chung cho các danh mục Admin/Staff
    let endpoint = collection;
    if (['theaters'].includes(collection)) endpoint = 'cinemas';
    if (['cinemaHalls'].includes(collection)) endpoint = 'cinemahalls';
    if (collection === 'staff-reports') endpoint = 'staff-reports'; // Thêm dòng này nếu cần update report

    // 1. Thêm dòng này để trỏ đúng đường dẫn admin
    if (collection === 'notifications') endpoint = 'notifications/admin';

    // --- THÊM: Map vouchers ---
    if (collection === 'vouchers') endpoint = 'vouchers';

    // --- [BỔ SUNG TỪ CODE 2] Mapping thêm các alias ---
    if (collection === 'promotions') endpoint = 'vouchers/admin';
    if (collection === 'bookings') endpoint = 'bookings';
    // --------------------------------------------------

    const payload = { ...item } as any;
    ['_id', 'createdAt', 'updatedAt', '_destroy', 'slug'].forEach(k => delete payload[k]);

    if (collection === 'showtimes') {
        delete payload.cinemaId; delete payload.movieId; delete payload.theaterId; delete payload.seats;
    }

    // --- 3. THÊM ĐOẠN NÀY: Xử lý riêng cho 'users' để tránh lỗi Joi ---
    // --- SỬA LẠI ĐOẠN XỬ LÝ USER ---
    if (collection === 'users') {
        delete payload.email;     // Vẫn cấm sửa email
        delete payload.googleId;  // Vẫn cấm sửa googleId
        delete payload.facebookId;

        // LOGIC MỚI: 
        // Chỉ xóa password khỏi payload nếu nó RỖNG hoặc NULL.
        // Nếu Admin nhập pass mới, field này sẽ được giữ lại và gửi lên Backend.
        if (!payload.password || payload.password.trim() === '') {
            delete payload.password;
        }
    }

    // --- THÊM ĐOẠN NÀY: Xử lý riêng cho notifications ---
    if (collection === 'notifications') {
        // Validation backend không cho phép sửa các trường này, nên phải xóa khỏi payload
        delete payload.type;
        delete payload.target;
        delete payload.userId;
        delete payload.username; // Nếu bạn đã đổi sang dùng username
        delete payload.user;     // Nếu object user dính vào từ lúc get list
    }

    // Gọi PUT hoặc PATCH tùy backend
    const method = (
      collection === 'orders' || 
      collection === 'tickets' || 
      collection === 'users' || 
      collection === 'bookings' || 
      collection === 'notifications') ? 'patch' : 'put';
    
    const res = await (axios as any)[method](`${BASE_URL}/${endpoint}/${id}`, payload, getHeader());
    return res.data;
  },

  async remove(collection: string, id: string) {
    let endpoint = collection;
    if (collection === 'theaters') endpoint = 'cinemas';
    if (collection === 'staff-reports') endpoint = 'staff-reports';

    // 1. Xử lý riêng cho Vouchers (Thêm /admin vào đường dẫn)
    if (collection === 'vouchers') {
        const res = await axios.delete(`${BASE_URL}/vouchers/admin/${id}`, getHeader());
        return res.data;
    }

    // --- THÊM ĐOẠN NÀY: Map notifications sang endpoint admin ---
    if (collection === 'notifications') {
        endpoint = 'notifications/admin';
    }

    const res = await axios.delete(`${BASE_URL}/${endpoint}/${id}`, getHeader());
    return res.data;
  },

  // --- 4. AUTH & USER UTILS ---
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
  // Sửa đường dẫn từ /tickets/my-tickets thành /bookings/history
    const res = await axios.get(`${BASE_URL}/bookings/history`, { params, ...getHeader() });
    return res.data;
  },

  async getMyTicket(id: string) {
    // SỬA DÒNG NÀY: Trỏ về /bookings/history/:id
    const res = await axios.get(`${BASE_URL}/bookings/history/${id}`, getHeader());
    return res.data;
  },

  async applyVoucher(code: string, total: number) {
    const res = await axios.post(`${BASE_URL}/vouchers/apply`, { code, total }, getHeader());
    return res.data; 
  },

  async holdSeats(showtimeId: string, seatNumbers: string[]) {
    const res = await axios.post(`${BASE_URL}/showtimes/${showtimeId}/hold-seats`, { seatNumbers }, getHeader());
    return res.data;
  },

  async releaseSeats(showtimeId: string, seatNumbers: string[]) {
    await axios.post(`${BASE_URL}/showtimes/${showtimeId}/release-seats`, { seatNumbers }, getHeader());
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
  
  async aiChat(userId: string, message: string) {
      const res = await axios.post(`${BASE_URL}/ai/chat`, { userId, message });
      return res.data;
  },

  async aiHistory(userId: string) {
      const res = await axios.get(`${BASE_URL}/ai/history/${userId}`);
      return res.data;
  }
}
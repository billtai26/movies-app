// file: src/lib/backendApi.ts
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

export const api = {
  // --- 1. CÁC HÀM GET DỮ LIỆU CỤ THỂ ---
  async listMovies(params?: { 
    status?: 'now_showing' | 'coming_soon'; 
    limit?: number; 
    page?: number;
    q?: string; 
  }) {
    const res = await axios.get(`${BASE_URL}/movies`, { params })
    return res.data
  },
  
  async getMovie(id: string) {
    const res = await axios.get(`${BASE_URL}/movies/${id}`)
    return res.data
  },

  async listTheaters() {
    const res = await axios.get(`${BASE_URL}/cinemas`) // Endpoint khác tên collection
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

  async listCombos() {
    const res = await axios.get(`${BASE_URL}/combos`)
    return res.data
  },

  async listUsers(params?: any) {
    // Cập nhật để nhận params (phân trang)
    const res = await axios.get(`${BASE_URL}/users`, { params })
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

  // --- 2. HÀM LIST TỔNG HỢP (QUAN TRỌNG CHO CRUD TABLE) ---
  // Hàm này giúp CrudTable gọi đúng API dựa vào tên collection (schema.name)
  async list(collection: string, params?: any) {
    console.log(`API Generic List: ${collection}`, params);
    
    // Mapping các collection đặc biệt (tên collection != tên endpoint)
    if (collection === 'movies') return this.listMovies(params);
    if (collection === 'users') return this.listUsers(params);
    if (collection === 'theaters') return this.listTheaters();
    if (collection === 'promotions') return this.listPromos();
    if (collection === 'tickets') return this.listTickets(params);
    
    // Mặc định: gọi theo tên collection (ví dụ: comments, showtimes)
    const token = getAuthToken();
    const cfg: any = { params };
    if (token) cfg.headers = { Authorization: `Bearer ${token}` };
    
    try {
      const res = await axios.get(`${BASE_URL}/${collection}`, cfg);
      return res.data;
    } catch (error) {
      console.error(`Error listing ${collection}`, error);
      return [];
    }
  },

  // --- 3. HÀM UPLOAD POSTER RIÊNG ---
  async uploadMoviePoster(id: string, file: File) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('poster', file); 

    const res = await axios.patch(`${BASE_URL}/movies/${id}/poster`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    return res.data;
  },

  // --- 4. HÀM CREATE (CÓ XỬ LÝ UPLOAD ẢNH CHO PHIM) ---
  async create<T>(collection: string, item: T) {
    const token = getAuthToken();
    
    // XỬ LÝ ĐẶC BIỆT CHO MOVIES
    if (collection === 'movies') {
       const { poster, ...movieData } = item as any;
       // B1: Tạo thông tin phim
       const res = await axios.post(`${BASE_URL}/movies`, movieData, {
         headers: { Authorization: `Bearer ${token}` }
       });
       const createdMovie = res.data;

       // B2: Upload poster nếu có
       if (poster && poster instanceof File) {
         const movieId = createdMovie.id || createdMovie._id; 
         await api.uploadMoviePoster(movieId, poster);
       }
       return createdMovie;
    }

    // CÁC TRƯỜNG HỢP KHÁC
    const url = collection === 'comments' ? `${BASE_URL}/comments` : `${BASE_URL}/${collection}`
    const payload = collection === 'comments' ? ({
      movieId: (item as any)?.movieId,
      content: (item as any)?.content,
      parentId: (item as any)?.parentId ?? null
    }) : item
    
    const res = await axios.post(url, payload, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return res.data
  },

  // --- 5. HÀM UPDATE (CÓ XỬ LÝ UPLOAD ẢNH CHO PHIM) ---
  async update<T>(collection: string, id: string, item: T) {
    const token = getAuthToken();

    // XỬ LÝ ĐẶC BIỆT CHO MOVIES
    if (collection === 'movies') {
       const { poster, ...movieData } = item as any;
       // B1: Update thông tin
       const res = await axios.put(`${BASE_URL}/movies/${id}`, movieData, {
         headers: { Authorization: `Bearer ${token}` }
       });
       
       // B2: Update poster nếu chọn file mới
       if (poster && poster instanceof File) {
          await api.uploadMoviePoster(id, poster);
       }
       return res.data;
    }

    // CÁC TRƯỜNG HỢP KHÁC
    const url = collection === 'comments' ? `${BASE_URL}/comments/${id}` : `${BASE_URL}/${collection}/${id}`
    const res = await axios.put(url, item, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return res.data
  },

  // --- 6. HÀM REMOVE (BỊ THIẾU NÊN BÁO LỖI) ---
  async remove(collection: string, id: string) {
    const token = getAuthToken();
    const url = collection === 'comments' ? `${BASE_URL}/comments/${id}` : `${BASE_URL}/${collection}/${id}`
    const res = await axios.delete(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return res.data
  },

  // --- 7. AUTH & USER UTILS ---
  async login(email: string, password: string){
    const path = AUTH_ENDPOINTS.login[0]
    const url = `${BASE_URL}${path}`
    const res = await axios.post(url, { email, password })
    return res.data
  },

  async register(payload: { username: string; email: string; password: string }){
    const path = AUTH_ENDPOINTS.register[0]
    const url = `${BASE_URL}${path}`
    const res = await axios.post(url, payload)
    return res.data
  },

  async requestPasswordReset(email: string){
    const path = AUTH_ENDPOINTS.forgotPassword[0]
    const url = `${BASE_URL}${path}`
    const res = await axios.post(url, { email })
    return res.data
  },

  async resetPassword(token: string, password: string) {
    const url = `${BASE_URL}/users/reset-password/${token}`
    const res = await axios.put(url, { password })
    return res.data
  },

  async getProfile() {
    const token = getAuthToken();
    if (!token) return null;
    const res = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  async updateProfileUser(data: { username?: string; phone?: string; dob?: string }) {
    const token = getAuthToken();
    const res = await axios.put(`${BASE_URL}/users/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  async updateAvatarUser(file: File) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await axios.patch(`${BASE_URL}/users/profile/avatar`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    return res.data;
  },

  async applyVoucher(code: string, total: number) {
    const token = getAuthToken();
    if (!token) throw new Error('Bạn cần đăng nhập để áp dụng voucher');
    const res = await axios.post(`${BASE_URL}/vouchers/apply`, 
      { code, total },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; 
  },

  async holdSeats(showtimeId: string, seatNumbers: string[]) {
    const token = getAuthToken();
    if (!token) throw new Error('Vui lòng đăng nhập để chọn ghế.');
    const res = await axios.post(
      `${BASE_URL}/showtimes/${showtimeId}/hold-seats`,
      { seatNumbers },
      { headers: { Authorization: `Bearer ${token}` } }
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
}

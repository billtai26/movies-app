
import movies from './mockData/movies.json'
import theaters from './mockData/theaters.json'
import rooms from './mockData/rooms.json'
import showtimes from './mockData/showtimes.json'
import combos from './mockData/combos.json'
import users from './mockData/users.json'
import promos from './mockData/promos.json'
import articles from './mockData/articles.json'

const wait = (ms:number)=>new Promise(res=>setTimeout(res,ms))

export const api = {
  async listMovies(params?: { status?: 'now_showing' | 'coming_soon'; limit?: number; page?: number; q?: string }) {
    await wait(200);

    // Lấy toàn bộ phim từ mock
    const allMovies = movies as any[];

    // 1. Lọc theo status (nếu có)
    let filteredMovies = allMovies;
    if (params?.status) {
      // Chuyển đổi status của mockApi cho khớp
      // (Vì mockApi dùng 'now' còn api thật dùng 'now_showing')
      const mockStatus = params.status === 'now_showing' ? 'now' : (params.status === 'coming_soon' ? 'coming' : params.status);
      filteredMovies = allMovies.filter(m => m.status === mockStatus);
    }
    
    // 2. Phân trang (logic giống API thật)
    const limit = params?.limit || 10; // Giới hạn mặc định là 10
    const page = params?.page || 1;
    const startIndex = (page - 1) * limit;
    const paginatedMovies = filteredMovies.slice(startIndex, startIndex + limit);

    // 3. Trả về cấu trúc giống hệt API thật
    return {
      movies: paginatedMovies,
      pagination: {
        totalMovies: filteredMovies.length,
        totalPages: Math.ceil(filteredMovies.length / limit),
        currentPage: page,
        limit: limit
      }
    };
  },
  async getMovie(id:string){ await wait(150); return movies.find(m=>m.id===id) },
  async listShowtimesByMovie(movieId:string, cinemaId?: string){ await wait(150); return showtimes.filter(s=> s.movieId===movieId && (!cinemaId || (s as any).cinemaId===cinemaId || (s as any).theaterId===cinemaId)) },
  async getShowtime(id:string){ await wait(120); return showtimes.find(s=>s.id===id) },
  async listCombos(){ await wait(100); return combos },
  async listUsers(){ await wait(120); return users },
  async listTheaters(){ await wait(120); return theaters },
  async listRooms(theaterId?:string){ await wait(120); return theaterId?rooms.filter(r=>r.theaterId===theaterId):rooms },
  async listShowtimes(){ await wait(120); return showtimes },
  async listPromos(){ await wait(100); return promos },
  async listArticles(){ await wait(100); return articles },
  async listComments(movieId?: string) {
    await wait(100)
    try{
      const raw = movieId ? localStorage.getItem(`comments::${movieId}`) : null
      const arr = raw ? JSON.parse(raw as any) : []
      return { comments: Array.isArray(arr)? arr: [] }
    }catch{ return { comments: [] } }
  },

  // --- Vé: thêm để khớp kiểu với backendApi ---
  async listTickets(params?: { page?: number; limit?: number }){
    await wait(150)
    const sample = [
      { id: 'tk1', code: 'OC-0001', movieTitle: 'Avatar', seats: ['A1','A2'], cinema: 'Only Cinema Landmark', room: 'Room A', startTime: '2025-11-30T19:00', price: 180000, status: 'done' },
      { id: 'tk2', code: 'OC-0002', movieTitle: 'Tron: Ares', seats: ['B3'], cinema: 'Only Cinema Crescent', room: 'Room B', startTime: '2025-12-01T21:00', price: 90000, status: 'pending' },
    ]
    const limit = params?.limit || 5
    const page = params?.page || 1
    const start = (page-1)*limit
    const slice = sample.slice(start, start+limit)
    return { tickets: slice, pagination: { totalPages: Math.ceil(sample.length/limit), currentPage: page } }
  },
  async getTicket(id: string){
    await wait(120)
    const item = [{ id: 'tk1', code: 'OC-0001', movieTitle: 'Avatar', seats: ['A1','A2'], cinema: 'Only Cinema Landmark', room: 'Room A', startTime: '2025-11-30T19:00', price: 180000, status: 'done' },
                  { id: 'tk2', code: 'OC-0002', movieTitle: 'Tron: Ares', seats: ['B3'], cinema: 'Only Cinema Crescent', room: 'Room B', startTime: '2025-12-01T21:00', price: 90000, status: 'pending' }].find(t=> String((t as any).id)===String(id))
    return item || null
  },

  async login(email: string, password: string){
    await wait(200)
    if (!email || !password) return Promise.reject({ response: { data: { message: 'Email/Mật khẩu không hợp lệ' } } })
    const user = { name: email.split('@')[0], email, avatar: `https://i.pravatar.cc/150?u=${email}` }
    return { token: 'mock-token', user }
  },
  async register(payload: { name?: string; email: string; password: string }){
    await wait(250)
    if (!payload?.email || !payload?.password) return Promise.reject({ response: { data: { message: 'Thiếu email/mật khẩu' } } })
    const user = { name: payload.name || payload.email.split('@')[0], email: payload.email, avatar: `https://i.pravatar.cc/150?u=${payload.email}` }
    return { token: 'mock-token', user }
  },
  async requestPasswordReset(email: string) {
    console.log('Mock API: Requesting password reset for', email)
    return { message: '✅ Mock: Nếu email tồn tại, link reset đã được gửi!' }
  },

  // --- THÊM HÀM MỚI NÀY VÀO ---
  async resetPassword(token: string, password: string) {
    console.log('Mock API: Resetting password with token', token)
    if (!token || !password) {
      throw new Error('Mock: Token và mật khẩu là bắt buộc')
    }
    // Trả về một thông báo thành công giả
    return { message: '✅ Mock: Đặt lại mật khẩu thành công!' }
  },
  
  async create<T>(collection: string, item: T) {
    await wait(500);
    console.log(`MOCK CREATE in ${collection}:`, item);
    return Promise.resolve({ ...item, id: `mock_${Math.random()}` });
  },
  async update<T>(collection: string, id: string, item: T) {
    await wait(500);
    console.log(`MOCK UPDATE in ${collection} (id: ${id}):`, item);
    return Promise.resolve({ ...item, id });
  },
  async remove(collection: string, id: string) {
    await wait(500);
    console.log(`MOCK REMOVE in ${collection} (id: ${id})`);
    return Promise.resolve({ message: 'Mock delete successful' });
  },

  // --- HÀM MỚI QUAN TRỌNG (ĐỂ SỬA LỖI TYPESCRIPT) ---
  async applyVoucher(code: string, total: number) {
    console.log('MOCK API: Applying voucher', { code, total });
    await wait(1000); // Giả lập 1 giây chờ
    
    if (code === 'MOCK10') {
      const discountAmount = Math.floor(total * 0.1); // Giảm 10%
      return Promise.resolve({
        discountAmount: discountAmount,
        finalAmount: total - discountAmount,
        message: 'Áp dụng mã MOCK10 thành công (giảm 10%)'
      });
    }
    if (code === 'SHIP30K' && total >= 100000) {
      const discountAmount = 30000;
      return Promise.resolve({
        discountAmount: discountAmount,
        finalAmount: total - discountAmount,
        message: 'Áp dụng mã SHIP30K thành công (giảm 30.000đ)'
      });
    }

    // Giả lập lỗi
    return Promise.reject({ response: { data: { message: 'Mã voucher không hợp lệ hoặc đã hết hạn' } } });
  }
}

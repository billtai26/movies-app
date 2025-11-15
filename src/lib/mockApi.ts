
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
  async listMovies(params?: { status?: 'now_showing' | 'coming_soon'; limit?: number; page?: number }) {
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
  async listShowtimesByMovie(movieId:string){ await wait(150); return showtimes.filter(s=>s.movieId===movieId) },
  async getShowtime(id:string){ await wait(120); return showtimes.find(s=>s.id===id) },
  async listCombos(){ await wait(100); return combos },
  async listUsers(){ await wait(120); return users },
  async listTheaters(){ await wait(120); return theaters },
  async listRooms(theaterId?:string){ await wait(120); return theaterId?rooms.filter(r=>r.theaterId===theaterId):rooms },
  async listShowtimes(){ await wait(120); return showtimes },
  async listPromos(){ await wait(100); return promos },
  async listArticles(){ await wait(100); return articles },
  async create<T>(collection:string,item:T){ await wait(200); return { ok:true, id:Math.random().toString(36).slice(2), item } },
  async update<T>(collection:string,id:string,item:T){ await wait(200); return { ok:true, id, item } },
  async remove(collection:string,id:string){ await wait(200); return { ok:true, id } },
}

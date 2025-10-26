
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
  async listMovies(status?:'now'|'coming'){ await wait(200); return status?movies.filter(m=>m.status===status):movies },
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

import axios from 'axios'
import { BASE_URL } from './config'

export const api = {
  // Đảm bảo hàm listMovies của bạn trông như thế này
  // Sửa THÀNH (giống hệt mockApi):
  async listMovies(params?: { status?: 'now_showing' | 'coming_soon'; limit?: number; page?: number }) {
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
  async create<T>(collection: string, item: T) {
    const res = await axios.post(`${BASE_URL}/${collection}`, item)
    return res.data
  },
  async update<T>(collection: string, id: string, item: T) {
    const res = await axios.put(`${BASE_URL}/${collection}/${id}`, item)
    return res.data
  },
  async remove(collection: string, id: string) {
    const res = await axios.delete(`${BASE_URL}/${collection}/${id}`)
    return res.data
  },
}

// src/lib/mockCrud.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";

type Id = string | number;

function formatDateTime(dt: string | Date | undefined) {
  if (!dt) return "";
  try {
    const date = new Date(dt);
    const d = date.getUTCDate().toString().padStart(2, "0");
    const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const y = date.getUTCFullYear();
    const h = date.getUTCHours().toString().padStart(2, "0");
    const mi = date.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${mi} ${d}/${m}/${y}`;
  } catch {
    return String(dt);
  }
}

// ✅ Chuẩn hóa dữ liệu nhận từ backend
const norm = (x: any) => ({
  ...x,
  id: x?._id ?? x?.id,
  roomName: x?.roomName ?? x?.name ?? "",
  theaterName: x?.theater?.name ?? x?.theaterName ?? "",
  theater: x?.theater?._id ?? x?.theater ?? "",
  movieTitle: x?.movie?.title ?? x?.movieTitle ?? "",
  movie: typeof x?.movie === "object" ? x.movie.title : x.movie,
  userName: x?.user?.name ?? x?.userName ?? "",
  comboName: x?.combo?.name ?? x?.comboName ?? "",
  startTime: x?.startTime ? formatDateTime(x.startTime) : "",
  endTime: x?.endTime ? formatDateTime(x.endTime) : "",
});

const normList = (arr: any[]) => (Array.isArray(arr) ? arr.map(norm) : []);

// 🧠 Hook CRUD chính
export function useCollection<T = any>(collectionName: string) {
  const key = (collectionName || "").toLowerCase().trim();

  // ✅ Map chuẩn khớp BE
  const pathMap: Record<string, string> = {
    movies: "movies",
    showtimes: "showtimes",
    genres: "genres",
    combos: "combos",
    theaters: "theaters",
    tickets: "tickets",
    users: "users",
    vouchers: "vouchers", // ✅ sửa từ promotions/promos
    "rooms-seats": "rooms", // ✅ dùng route /api/rooms
    comments: "comments",
    reports: "staff-reports", // ✅ đổi đúng route BE
  };

  const path = pathMap[key] || key;
  const base = `${BASE_URL}/api/${path}`; // ✅ thêm /api vào base

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // 🔄 Load danh sách
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get(base)
      .then((r) => {
        if (!mounted) return;
        const payload = r.data?.data ?? r.data;
        setRows(normList(payload) as any);
      })
      .catch((e) => {
        if (mounted) setError(e);
        console.error("❌ Load error:", e?.response?.data || e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [base]);

  // ➕ Create
  const create = async (data: Partial<T>) => {
    const res = await axios.post(base, data);
    const item = norm(res.data) as any;
    setRows((prev) => [...prev, item]);
    return item;
  };

  // ✏️ Update
  const update = async (id: Id | any, data: Partial<T>) => {
    const realId = id?._id ?? id?.id ?? id;
    if (!realId) {
      console.error("❌ update() invalid id:", id);
      return;
    }
    const res = await axios.put(`${base}/${realId}`, data);
    const item = norm(res.data) as any;
    setRows((prev) =>
      prev.map((r: any) =>
        r._id === realId || r.id === realId ? item : r
      )
    );
    return item;
  };

  // ❌ Delete
  const remove = async (id: Id | any) => {
    const realId = id?._id ?? id?.id ?? id;
    if (!realId) {
      console.error("❌ remove() invalid id:", id);
      return;
    }
    await axios.delete(`${base}/${realId}`);
    setRows((prev) =>
      prev.filter((r: any) => (r._id ?? r.id) != realId)
    );
  };

  return { rows, setRows, loading, error, create, update, remove };
}

// src/ui/pages/admin/Showtimes.tsx
import { useEffect, useState, useMemo } from "react";
import CrudTable from "../../components/CrudTable";
import { EntitySchema } from "../../../types/entities";
import { api } from "../../../lib/backendApi";

// Định nghĩa kiểu cho Map
type DataMap = Record<string, string>;

export default function Showtimes() {
  const [movieMap, setMovieMap] = useState<DataMap>({});
  const [cinemaMap, setCinemaMap] = useState<DataMap>({});
  const [roomMap, setRoomMap] = useState<DataMap>({});
  
  const [movieOptions, setMovieOptions] = useState<{ label: string; value: string }[]>([]);
  const [cinemaOptions, setCinemaOptions] = useState<{ label: string; value: string }[]>([]);
  const [roomOptions, setRoomOptions] = useState<{ label: string; value: string }[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesData, cinemasData, roomsData] = await Promise.all([
          api.listMovies({ limit: 100 }),
          api.listTheaters(),
          api.listRooms()
        ]);

        // 1. Tạo Map cho Movies (ID -> Tên)
        const movieList = Array.isArray(moviesData) ? moviesData : (moviesData.movies || []);
        const mMap: DataMap = {};
        const mOptions = movieList.map((m: any) => {
            mMap[m._id] = m.title;
            return { label: m.title, value: m._id };
        });
        setMovieMap(mMap);
        setMovieOptions(mOptions);

        // 2. Tạo Map cho Cinemas (ID -> Tên)
        const cinemaList = Array.isArray(cinemasData) ? cinemasData : (cinemasData.cinemas || []);
        const cMap: DataMap = {};
        const cOptions = cinemaList.map((c: any) => {
            cMap[c._id] = c.name;
            return { label: c.name, value: c._id };
        });
        setCinemaMap(cMap);
        setCinemaOptions(cOptions);

        // 3. Tạo Map cho Rooms (ID -> Tên)
        let roomList: any[] = [];
        if (roomsData?.halls) roomList = roomsData.halls;
        else if (Array.isArray(roomsData)) roomList = roomsData;
        else if (roomsData?.cinemaHalls) roomList = roomsData.cinemaHalls;

        const rMap: DataMap = {};
        const rOptions = roomList.map((r: any) => {
             const cName = cMap[r.cinemaId] || "";
             const suffix = cName ? ` - ${cName}` : "";
             const fullName = `${r.name}${suffix}`;
             rMap[r._id] = fullName;
             return { label: fullName, value: r._id };
        });
        setRoomMap(rMap);
        setRoomOptions(rOptions);

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const schema: EntitySchema = useMemo(() => ({
    name: "showtimes",
    title: "Quản lý Lịch chiếu",
    columns: [
      { key: "startTime", label: "Bắt đầu" },
      // SỬA LẠI KEY CHO KHỚP VỚI API (movieId, cinemaId...)
      { key: "movieId", label: "Phim" },
      { key: "cinemaId", label: "Rạp" },
      { key: "theaterId", label: "Phòng" },
    ],
    fields: [
      {
        key: "movieId",
        label: "Chọn Phim",
        type: "select",
        required: true,
        options: movieOptions,
        readonlyOnEdit: true,
      },
      {
        key: "cinemaId",
        label: "Chọn Cụm Rạp",
        type: "select",
        required: true,
        options: cinemaOptions,
        readonlyOnEdit: true,
      },
      {
        key: "theaterId",
        label: "Chọn Phòng Chiếu",
        type: "select",
        required: true,
        options: roomOptions,
        readonlyOnEdit: true,
      },
      {
        key: "startTime",
        label: "Thời gian bắt đầu",
        type: "datetime",
        required: true,
      },
      {
        key: "basePrice",
        label: "Giá vé thường (VNĐ)",
        type: "number",
        required: true,
        placeholder: "Ví dụ: 70000"
      },
      {
        key: "vipPrice",
        label: "Giá vé VIP (VNĐ)",
        type: "number",
        required: true,
        placeholder: "Ví dụ: 90000"
      }
    ],
    
    // --- HÀM BIẾN ĐỔI DỮ LIỆU HIỂN THỊ (QUAN TRỌNG) ---
    transformRow: (row: any) => {
        const d = new Date(row.startTime);
        
        // 👉 SỬA LẠI: Lấy giờ UTC (getUTCHours) thay vì giờ Local
        // Cách này sẽ hiển thị đúng số 10:00 mà bạn thấy trong Database
        const day = d.getUTCDate().toString().padStart(2, '0');
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = d.getUTCFullYear();
        const hours = d.getUTCHours().toString().padStart(2, '0');
        const minutes = d.getUTCMinutes().toString().padStart(2, '0');
        
        const formattedTime = `${hours}:${minutes} ${day}/${month}/${year}`;

        return {
            ...row,
            movieId: movieMap[row.movieId] || "Đang tải...", 
            cinemaId: cinemaMap[row.cinemaId] || "Đang tải...",
            theaterId: roomMap[row.theaterId] || "Đang tải...",
            
            startTime: formattedTime // Kết quả: "10:00 08/12/2025"
        };
    },

    // Logic giữ nguyên giờ khi Lưu (như đã làm ở bước trước)
    toPayload: (data: any) => {
        const localDate = new Date(data.startTime);
        const preservedTime = new Date(Date.UTC(
            localDate.getFullYear(), localDate.getMonth(), localDate.getDate(),
            localDate.getHours(), localDate.getMinutes(), 0
        ));
        return { ...data, startTime: preservedTime.toISOString() };
    },

    // Logic hiển thị giờ khi Sửa
    toForm: (data: any) => {
        if (!data.startTime) return data;
        const utcDate = new Date(data.startTime);
        const localDate = new Date(
            utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(),
            utcDate.getUTCHours(), utcDate.getUTCMinutes()
        );
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatted = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;
        return { ...data, startTime: formatted };
    }
  }), [movieOptions, cinemaOptions, roomOptions, movieMap, cinemaMap, roomMap]);

  if (isLoading) return <div>Đang tải dữ liệu...</div>;

  return <CrudTable schema={schema} />;
}

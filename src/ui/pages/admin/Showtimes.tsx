import CrudTable from "../../components/CrudTable";

export default function Showtimes() {
  const schema = {
    name: "showtimes",
    title: "Lịch chiếu",
    columns: [
      { key: "movie", label: "Phim" },
      { key: "cinema", label: "Rạp" },
      { key: "startTime", label: "Bắt đầu" },
      { key: "endTime", label: "Kết thúc" },
    ],
    fields: [
      {
        key: "movie",
        label: "Phim",
        type: "select",
        required: true,
        options: [
          { label: "Avatar 2", value: "Avatar 2" },
          { label: "Tron Ares", value: "Tron Ares" },
          { label: "Inside Out 2", value: "Inside Out 2" },
        ],
      },
      {
        key: "cinema",
        label: "Rạp/Cụm",
        type: "select",
        required: true,
        options: [
          { label: "Cinesta Q1", value: "Q1" },
          { label: "Cinesta Thủ Đức", value: "TD" },
          { label: "Cinesta Gò Vấp", value: "GV" },
        ],
      },
      {
        key: "startTime",
        label: "Thời gian bắt đầu",
        type: "datetime",
        required: true,
      },
       {
        key: "endTime",
        label: "Thời gian kết thúc", // 🆕 thêm trường mới
        type: "datetime",
        required: true,
      },
    ],
  };

  return <CrudTable schema={schema} />;
}

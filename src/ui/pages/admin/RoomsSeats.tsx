import CrudTable from "../../components/CrudTable";

export default function RoomsSeats() {
  const schema = {
    name: "rooms",
    title: "Phòng & Ghế",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Phòng" },
      { key: "cinema", label: "Rạp/Cụm" },
    ],
    fields: [
      {
        key: "name",
        label: "Tên phòng",
        type: "text",
        required: true,
        placeholder: "Nhập tên phòng (VD: Room A)",
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
    ],
  };

  return <CrudTable schema={schema} />;
}

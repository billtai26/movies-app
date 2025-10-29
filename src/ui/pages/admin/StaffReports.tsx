import React, { useEffect } from "react";
import CrudTable from "../../components/CrudTable";
import { useLocalStorageCRUD } from "../../../store/useLocalStorageCRUD";

export default function AdminStaffReports() {
  // 🔹 Nếu chưa có dữ liệu thì seed
  useEffect(() => {
    if (!localStorage.getItem("admin_staff_reports")) {
      localStorage.setItem(
        "admin_staff_reports",
        JSON.stringify([
          {
            id: "1",
            staff: "Tuấn",
            message: "Máy in quét vé bị lỗi",
            status: "Chưa duyệt",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            staff: "Linh",
            message: "Khách không nhận được QR code",
            status: "Đã duyệt",
            createdAt: new Date().toISOString(),
          },
        ])
      );
    }
  }, []);

  const { data, addItem, updateItem, deleteItem } =
    useLocalStorageCRUD<any>("admin_staff_reports", []);

  const schema = {
    name: "admin_staff_reports",
    title: "Báo cáo từ nhân viên",
    columns: [
      { key: "id", label: "#" },
      { key: "staff", label: "Nhân viên" },
      { key: "message", label: "Nội dung" },
      { key: "status", label: "Trạng thái" },
      { key: "createdAt", label: "Thời gian" },
    ],
    fields: [
      { key: "staff", label: "Tên nhân viên", type: "text", required: true },
      { key: "message", label: "Nội dung", type: "textarea", required: true },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: ["Chưa duyệt", "Đã duyệt", "Từ chối"],
        required: true,
      },
    ],
  };

  const customActions = (r: any) => (
    <div className="flex justify-center flex-wrap gap-2">
      <button
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={() => updateItem(r.id, { ...r, status: "Đã duyệt" })}
      >
        Duyệt
      </button>
      <button
        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
        onClick={() => updateItem(r.id, { ...r, status: "Từ chối" })}
      >
        Từ chối
      </button>
      <button
        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
        onClick={() => deleteItem(r.id)}
      >
        Xóa
      </button>
    </div>
  );

  return (
    <CrudTable
      schema={schema as any}
      canEdit={true}
      customActions={customActions}
      rows={data}
      create={addItem}
      update={updateItem}
      remove={deleteItem}
    />
  );
}

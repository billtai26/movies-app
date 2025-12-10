import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";
import axios from "axios";

// Định nghĩa kiểu dữ liệu
interface StaffReport {
  _id: string;
  staff: string;
  message: string;
  status: "Chưa duyệt" | "Đã duyệt" | "Từ chối";
  createdAt: string;
}

export default function AdminStaffReports() {
  const [data, setData] = useState<StaffReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gọi API
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      // Đảm bảo Backend đang chạy ở port 8000
      const response = await axios.get("http://localhost:8017/v1/admin_staff_reports"); 
      
      // Kiểm tra cấu trúc trả về. Nếu backend trả về { data: [...] } thì phải dùng response.data.data
      const result = Array.isArray(response.data) ? response.data : response.data.data || [];
      setData(result);
    } catch (error) {
      console.error("Lỗi kết nối Backend:", error);
      // Không crash trang nếu lỗi mạng, chỉ set data rỗng
      setData([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:8017/v1/admin_staff_reports/${id}`, {
        status: newStatus,
      });
      setData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, status: newStatus as any } : item
        )
      );
    } catch (error) {
      console.error("Lỗi update:", error);
      alert("Lỗi kết nối server!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa báo cáo này?")) return;
    try {
      await axios.delete(`http://localhost:8017/v1/admin_staff_reports/${id}`);
      setData((prevData) => prevData.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  const schema = {
    name: "admin_staff_reports",
    title: "Báo cáo từ nhân viên",
    columns: [
      { key: "_id", label: "ID" },
      { key: "staff", label: "Nhân viên" },
      { key: "message", label: "Nội dung" },
      { 
        key: "status", 
        label: "Trạng thái",
        // 🔥 FIX QUAN TRỌNG: Xử lý biến row an toàn
        render: (rowOrValue: any) => {
            // Lấy status từ object row HOẶC lấy trực tiếp nếu nó là value
            const val = rowOrValue?.status || rowOrValue;
            
            let color = "bg-gray-500";
            if(val === "Đã duyệt") color = "bg-green-500";
            else if(val === "Từ chối") color = "bg-red-500";
            else if(val === "Chưa duyệt") color = "bg-yellow-500";
            
            // Chỉ render nếu val là chuỗi/số, tránh render object gây crash
            return <span className={`px-2 py-1 rounded text-white text-xs ${color}`}>
              {typeof val === 'string' ? val : JSON.stringify(val)}
            </span>
        }
      },
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
      {/* Chỉ hiện các nút thao tác khi trạng thái là 'Chưa duyệt' */}
      {r.status === "Chưa duyệt" && (
        <>
          <button
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => handleUpdateStatus(r._id, "Đã duyệt")}
          >
            Duyệt
          </button>

          <button
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            onClick={() => handleUpdateStatus(r._id, "Từ chối")}
          >
            Từ chối
          </button>
        </>
      )}

      {/* Nút Xóa luôn hiện để dọn dẹp các bản ghi cũ */}
      <button
        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        onClick={() => handleDelete(r._id)}
      >
        Xóa
      </button>
    </div>
  );

  return (
    <CrudTable
      key={JSON.stringify(data)} 
      schema={schema as any}
      data={data} // 👈 QUAN TRỌNG: Bạn cần bỏ comment dòng này để bảng nhận dữ liệu
      canEdit={false} 
      canDelete={false}
      renderRowActions={customActions}
    />
  );
}
import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { format } from "date-fns";

export default function AdminStaffReports() {
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getAll(`staff-reports?month=${month}`);
      setRows(res || []);
    } catch (e) {
      console.error("❌ Lỗi tải báo cáo nhân viên:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  return (
    <CrudTable
      schema={schema as any}
      canEdit={true}
      customActions={customActions}
    />
  );
}

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../lib/config";

type Voucher = {
  _id?: string;
  title: string;
  image?: string;
  code?: string;
  discount?: number; // %
  desc?: string;
};

export default function PromoSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Fetch từ BE: /api/vouchers
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/vouchers`)
      .then((res) => {
        const data = (res.data?.data ?? res.data) as Voucher[]; // BE có thể trả {data: []} hoặc []
        setVouchers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("❌ Lỗi khi tải vouchers:", err));
  }, []);

  // Nhân đôi để cuộn vô hạn
  const items = [...vouchers, ...vouchers];

  // Tự cuộn + dừng khi hover
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;

    let active = true;
    const speed = 0.8;
    const timer = setInterval(() => {
      if (!active) return;
      el.scrollLeft += speed;
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
    }, 15);

    const stop = () => (active = false);
    const start = () => (active = true);
    el.addEventListener("mouseenter", stop);
    el.addEventListener("mouseleave", start);
    return () => {
      clearInterval(timer);
      el.removeEventListener("mouseenter", stop);
      el.removeEventListener("mouseleave", start);
    };
  }, [items.length]);

  return (
    <>
      <div className="border-t border-gray-600 mb-10"></div>

      <section className="my-10">
        <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">
          TIN KHUYẾN MÃI
        </h2>

        {vouchers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            Hiện chưa có chương trình khuyến mãi nào.
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-scroll scroll-smooth no-scrollbar select-none"
          >
            {items.map((p, i) => (
              <div
                key={(p._id ?? p.code ?? i) + "-" + i}
                className="flex-shrink-0 w-[260px] text-center transition hover:scale-[1.02]"
                title={p.code ? `Mã: ${p.code}` : undefined}
              >
                <img
                  src={p.image || "https://placehold.co/400x250?text=No+Image"}
                  alt={p.title}
                  className="w-full h-[170px] object-cover rounded-xl mb-2 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x250?text=No+Image";
                  }}
                />
                <p className="text-sm font-medium line-clamp-2">{p.title}</p>
                {(p.code || typeof p.discount === "number") && (
                  <p className="text-xs text-gray-500 mt-1">
                    {p.code ? `Mã: ${p.code}` : ""}{" "}
                    {typeof p.discount === "number" ? `• Giảm ${p.discount}%` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

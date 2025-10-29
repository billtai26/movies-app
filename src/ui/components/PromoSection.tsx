import React, { useEffect, useRef } from "react";

export default function PromoSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let scrollSpeed = 0.8; // 👈 tốc độ
    const interval = setInterval(() => {
      el.scrollLeft += scrollSpeed;
      // Khi đến cuối, reset nhẹ nhàng về giữa (vì ta nhân đôi mảng)
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
    }, 15);

    return () => clearInterval(interval);
  }, []);

  const promos = [
    { id: 1, title: "Snack Đủ Vị - Xem Phim Hay Hết Ý", img: "https://picsum.photos/400/250?random=11" },
    { id: 2, title: "Ngày Tri Ân Của Galaxy Cinema - Thứ Hai Đầu Tiên", img: "https://picsum.photos/400/250?random=12" },
    { id: 3, title: "Giá Vé U22 - Chỉ Từ 45k", img: "https://picsum.photos/400/250?random=13" },
    { id: 4, title: "Phân Loại Phim Theo Lứa Tuổi", img: "https://picsum.photos/400/250?random=14" },
    { id: 5, title: "Mua Vé Online - Ưu Đãi Đặc Biệt", img: "https://picsum.photos/400/250?random=15" },
  ];

  // 👇 nhân đôi mảng để tạo hiệu ứng vô hạn
  const doubledPromos = [...promos, ...promos];

  return (
    <>
    {/* --- Thanh ngang xám --- */}
      <div className="border-t border-gray-600 mb-10"></div>

    <section className="my-10">
      <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">
        TIN KHUYẾN MÃI
      </h2>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-scroll scroll-smooth no-scrollbar select-none"
      >
        {doubledPromos.map((p, i) => (
          <div key={i} className="flex-shrink-0 w-[260px] text-center">
            <img
              src={p.img}
              alt={p.title}
              className="w-full h-[170px] object-cover rounded-xl mb-2"
            />
            <p className="text-sm font-medium">{p.title}</p>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

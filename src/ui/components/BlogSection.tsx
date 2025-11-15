import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp } from "lucide-react";

export default function BlogSection() {
  const [activeTab, setActiveTab] = useState<"review" | "blog">("review");

  const data = {
    review: {
      main: {
        id: 1,
        title:
          "[Review] Cục Vàng Của Ngoại: Việt Hương – Hồng Đào Lấy Nước Mắt Khán Giả",
        img: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1400",
        likes: 456,
      },
      side: [
        {
          id: 2,
          title: "[Review] Tron Ares: Mãn Nhãn Với Công Nghệ Vượt Thời Đại",
          img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800",
          likes: 352,
        },
        {
          id: 3,
          title: "[Review] Từ Chiến Trên Không: Phim Việt Xuất Sắc Top Đầu 2025!",
          img: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=800",
          likes: 2616,
        },
        {
          id: 4,
          title:
            "[Review] The Conjuring Last Rites: Chương Cuối Trọn Vẹn Cảm Xúc",
          img: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=800",
          likes: 590,
        },
      ],
    },
    blog: {
      main: {
        id: 5,
        title: "Điều Gì Sẽ Xảy Ra Trong Predator: Badlands?",
        img: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1400",
        likes: 20,
      },
      side: [
        {
          id: 6,
          title: "Top Phim Hay Dịp Cuối Năm 2025",
          img: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=800",
          likes: 265,
        },
        {
          id: 7,
          title:
            "Final Destination Bloodlines: Hé Lộ Bí Mật Về Vòng Lặp Tử Thần",
          img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800",
          likes: 196,
        },
        {
          id: 8,
          title:
            "Bùi Thạc Chuyên Và 11 Năm Tâm Huyết Với Địa Đạo: Mặt Trời Trong Bóng Tối",
          img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800",
          likes: 182,
        },
      ],
    },
  };

  const content = activeTab === "review" ? data.review : data.blog;

  return (
    <>
    {/* --- Thanh ngang xám --- */}
      <div className="border-t border-gray-600 mb-10"></div>


    <section className="mt-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          <span className="border-l-4 border-blue-600 pl-2">GÓC ĐIỆN ẢNH</span>
        </h2>
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => setActiveTab("review")}
            className={`font-semibold ${
              activeTab === "review"
                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Bình luận phim
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`font-semibold ${
              activeTab === "blog"
                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Blog điện ảnh
          </button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left big post */}
        <div className="col-span-2 rounded-xl overflow-hidden shadow-sm border">
          <img
            src={content.main.img}
            alt={content.main.title}
            className="w-full h-[340px] object-cover"
          />
          <div className="p-4">
            <p className="font-semibold text-lg leading-snug mb-2">
              {content.main.title}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <button className="flex items-center gap-1 bg-[#1877f2] text-white text-xs px-2 py-1 rounded">
                <ThumbsUp size={12} /> Thích
              </button>
              <span>👁 {content.main.likes}</span>
            </div>
          </div>
        </div>

        {/* Right small posts */}
        <div className="flex flex-col gap-3">
          {content.side.map((p) => (
            <div key={p.id} className="flex gap-3 border rounded-lg p-2 shadow-sm">
              <img
                src={p.img}
                alt={p.title}
                className="w-28 h-20 object-cover rounded-md"
              />
              <div>
                <p className="text-sm font-medium leading-snug">{p.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                  <button className="flex items-center gap-1 bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded">
                    <ThumbsUp size={12} /> Thích
                  </button>
                  <span>👁 {p.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Xem thêm */}
      <div className="flex justify-center mt-8">
        {activeTab === "review" ? (
          <Link
            to="/reviews"
            className="border border-orange-500 text-orange-500 px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition"
          >
            Xem thêm →
          </Link>
        ) : (
          <Link
                to="/movie-blog"
                className="mx-auto mt-4 block border border-orange-500 text-orange-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition"
                >
                Xem thêm →
                </Link>
        )}
      </div>
    </section>
    </>
  );
}

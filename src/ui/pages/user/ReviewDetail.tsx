import React from "react";
import { useParams, Link } from "react-router-dom";
import { getReviewById } from "../../../lib/mockReviews";
import SidebarMovieCard from "../../components/SidebarMovieCard";

export default function ReviewDetail() {
  const { id } = useParams();
  const review = React.useMemo(() => (id ? getReviewById(id) : null), [id]);

  const nowPlaying = [
    { id: "m1", name: "Nhà Ma Xó", img: "https://picsum.photos/300/200?random=10", rating: "7.0" },
    { id: "m2", name: "Cục Vàng Của Ngoại", img: "https://picsum.photos/300/200?random=11", rating: "8.4" },
    { id: "m3", name: "Tee Yod: Quỷ Ăn Tạng 3", img: "https://picsum.photos/300/200?random=12", rating: "7.5" },
  ];

  if (!id || !review) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="border-l-4 border-orange-500 pl-3 mb-4">
          <h1 className="text-xl font-semibold">Không tìm thấy bài review</h1>
        </div>
        <p className="text-gray-600 mb-4">ID không hợp lệ hoặc bài viết đã bị xóa.</p>
        <Link to="/reviews" className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cột trái: nội dung chính */}
      <div className="md:col-span-2">
        {/* Breadcrumb đơn giản */}
        <div className="text-sm text-gray-500 mb-3">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/reviews" className="hover:text-blue-600">Bình luận phim</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Chi tiết</span>
        </div>

        {/* Tiêu đề theo mẫu */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {review.title}
        </h1>
        <p className="text-sm text-gray-600 mb-4">{review.excerpt}</p>

        {/* Ảnh lớn đầu bài */}
        <img
          src={review.heroImage}
          alt={review.title}
          className="w-full h-auto rounded-md mb-4"
        />

        {/* Nội dung bài */}
        <div className="prose max-w-none">
          {review.body.map((b, idx) => (
            b.type === "p" ? (
              <p key={idx} className="text-gray-800 leading-relaxed mb-4">
                {b.content}
              </p>
            ) : (
              <img key={idx} src={b.content} alt="review" className="w-full rounded-md my-3" />
            )
          ))}
        </div>
      </div>

      {/* Cột phải: mua vé nhanh + phim đang chiếu */}
      <aside className="space-y-6">
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-blue-800 text-white text-center py-2 font-medium">
            Mua Vé Nhanh
          </div>
          <div className="p-3 space-y-3">
            <select className="w-full border rounded-md text-sm px-3 py-1.5">
              <option>Chọn phim</option>
            </select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5">
              <option>Chọn rạp</option>
            </select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5">
              <option>Chọn ngày</option>
            </select>
            <button className="w-full bg-orange-500 text-white rounded-md py-1.5 text-sm hover:bg-orange-600">
              Mua Vé
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">
            PHIM ĐANG CHIẾU
          </h3>
          <div className="space-y-3">
            {nowPlaying.map((p) => (
              <SidebarMovieCard key={p.id} movie={p} />
            ))}
          </div>
          <Link
            to="/movies"
            className="block mx-auto mt-4 w-fit border border-orange-500 text-orange-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition"
          >
            Xem thêm →
          </Link>
        </div>
      </aside>
    </div>
  );
}
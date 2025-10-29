import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#0b2a5b] text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-3">GIỚI THIỆU</h4>
            <ul className="space-y-2 text-white/80">
              <li>Về Chúng Tôi</li>
              <li>Thỏa Thuận Sử Dụng</li>
              <li>Quy Chế Hoạt Động</li>
              <li>Chính Sách Bảo Mật</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">GÓC ĐIỆN ẢNH</h4>
            <ul className="space-y-2 text-white/80">
              <li>Thể Loại Phim</li>
              <li>Bình Luận Phim</li>
              <li>Blog Điện Ảnh</li>
              <li>Phim Hay Tháng</li>
              <li>Phim IMAX</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">HỖ TRỢ</h4>
            <ul className="space-y-2 text-white/80">
              <li>Góp Ý</li>
              <li>Sale & Services</li>
              <li>Rạp / Giá Vé</li>
              <li>Tuyển Dụng</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">ONLY CINEMA</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white" />
              <div className="text-white/80">Theo dõi chúng tôi</div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-xs text-white/70">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">TRANG CHỦ</p>
              <p className="mt-2">
                Only Cinema là cụm rạp với trải nghiệm điện ảnh chất lượng cao. Chúng tôi
                luôn nỗ lực mang đến những phút giây giải trí tuyệt vời nhất cho khán giả.
              </p>
            </div>
            <div className="flex items-center md:justify-end gap-3">
              <img
                className="h-8"
                src="https://upload.wikimedia.org/wikipedia/commons/2/2b/VN-ecommerce-registered.png"
                alt="Đã thông báo"
              />
            </div>
          </div>

          <p className="mt-6">
            © CÔNG TY CỔ PHẦN PHIM ONLY CINEMA — 2025. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

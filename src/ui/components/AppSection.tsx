import React from "react";

export default function AppSection() {
  return (
    <>
      {/* --- ĐƯỜNG KẺ NGANG TRÊN --- */}
      <div className="border-t border-gray-200"></div>

      {/* --- PHẦN MÀU XANH FULL WIDTH --- */}
      <section className="w-screen relative left-[50%] right-[50%] -mx-[50vw] bg-[#0A3172] text-white py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto px-6 md:px-10">
          {/* Ảnh điện thoại */}
          <div className="flex-1 flex justify-center md:justify-start">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800"
              alt="App preview"
              className="w-[280px] md:w-[400px] object-contain"
            />
          </div>

          {/* Nội dung bên phải */}
          <div className="flex-1 space-y-3 md:text-left text-center">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Đặt Vé Online – Không Lo Trễ Nải
            </h2>
            <p className="text-sm md:text-base opacity-90 leading-relaxed">
              Ghét đợi trong đám đông? Lười xếp hàng mua vé?  
              Hãy quên đi cách mua vé giấy truyền thống – đặt vé online cực nhanh, gọn lẹ và tiện lợi.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 mt-4">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://cinesta.vn"
                alt="QR code"
                className="w-[120px] h-[120px]"
              />
              <div className="flex flex-col gap-3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Available_on_the_App_Store_(black)_SVG.svg"
                  alt="App Store"
                  className="h-10"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Google Play"
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PHẦN TRANG CHỦ --- */}
      <section className="bg-white text-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-6 leading-relaxed text-sm md:text-base">
          <h2 className="text-lg md:text-xl font-semibold text-blue-600 border-l-4 border-blue-600 pl-2 mb-4">
            TRANG CHỦ
          </h2>

          <p className="mb-3">
            <a href="#" className="text-blue-600 font-medium hover:underline">Galaxy Cinema</a> là một trong những công ty tư nhân đầu tiên về điện ảnh được thành lập từ năm 2003, đã khẳng định thương hiệu là một trong 10 địa điểm vui chơi giải trí được yêu thích nhất. Ngoài hệ thống rạp chiếu phim hiện đại, thu hút hàng triệu lượt người đến xem, <a href="#" className="text-blue-600 font-medium hover:underline">Galaxy Cinema</a> còn hấp dẫn khán giả bởi không khí thân thiện cùng chất lượng dịch vụ hàng đầu.
          </p>

          <p className="mb-3">
            Đến website <a href="#" className="text-blue-600 font-medium hover:underline">galaxycine.vn</a>, khách hàng sẽ dễ dàng tham khảo các <a href="#" className="text-blue-600 font-medium hover:underline">phim hay nhất</a>, <a href="#" className="text-blue-600 font-medium hover:underline">phim mới nhất</a>, những <a href="#" className="text-blue-600 font-medium hover:underline">lịch chiếu phim</a> đang được cập nhật hàng giờ trên <a href="#" className="text-blue-600 font-medium hover:underline">trang chủ</a>.
          </p>

          <p className="mb-3">
            Giờ đây đặt vé tại <a href="#" className="text-blue-600 font-medium hover:underline">Galaxy Cinema</a> càng thêm dễ dàng chỉ với vài thao tác vô cùng đơn giản. Để mua vé, quý khách chỉ cần chọn mục <strong>Mua Vé</strong> theo phim, theo rạp hoặc theo ngày. Sau đó, tiến hành mua vé theo các bước hướng dẫn. Chỉ trong vài phút, quý khách sẽ nhận được tin nhắn và email phản hồi “Đặt vé thành công” của <a href="#" className="text-blue-600 font-medium hover:underline">Galaxy Cinema</a>. Quý khách có thể dùng tin nhắn lấy vé tại quầy hoặc quét mã QR để vào rạp mà không cần tốn thêm bất kỳ công đoạn nào nữa.
          </p>

          <p className="mb-3">
            Nếu bạn đã chọn được <a href="#" className="text-blue-600 font-medium hover:underline">phim hay để xem</a>, hãy đặt vé cực nhanh bằng box <strong>Mua Vé Nhanh</strong> ngay tại <strong>Trang Chủ</strong>. Chỉ cần một phút, tin nhắn và email phản hồi của <a href="#" className="text-blue-600 font-medium hover:underline">Galaxy Cinema</a> sẽ gửi ngay vào điện thoại và hộp mail của bạn.
          </p>

          <p>
            Nếu chưa quyết định sẽ xem <a href="#" className="text-blue-600 font-medium hover:underline">phim mới nào</a>, hãy tham khảo các bộ <a href="#" className="text-blue-600 font-medium hover:underline">phim hay</a> trong mục <a href="#" className="text-blue-600 font-medium hover:underline">Phim Đang Chiếu</a> cũng như <a href="#" className="text-blue-600 font-medium hover:underline">Phim Sắp Chiếu</a> tại <strong>rạp chiếu phim</strong> bằng cách vào mục <strong>Bình Luận Phim</strong> ở <strong>Góc Điện Ảnh</strong> để đọc những bài bình luận chân thật, hấp dẫn và cân nhắc. Sau đó, chỉ với vài cú nhấp chuột, bạn có thể đặt vé bằng box <strong>Mua Vé Nhanh</strong> ngay ở đầu trang để chọn được suất chiếu và chỗ ngồi ưng ý nhất.
          </p>
        </div>
      </section>
    </>
  );
}

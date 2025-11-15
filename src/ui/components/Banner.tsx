import axios from "axios";
import React from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BASE_URL } from "../../lib/config";

export default function Banner() {
  const [banners, setBanners] = React.useState<string[]>([]);
React.useEffect(() => {
  axios.get(`${BASE_URL}/api/vouchers`).then(res => {
    setBanners(res.data.map((v: any) => v.image));
  });
}, []);

  const sliderRef = React.useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    centerMode: true,
    centerPadding: "150px",
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    arrows: false,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { centerPadding: "60px" } },
      { breakpoint: 640, settings: { centerMode: false } },
    ],
    appendDots: (dots: React.ReactNode) => (
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ul className="flex gap-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 rounded-full bg-gray-300 hover:bg-[#f58a1f]" />
    ),
  };

  return (
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] overflow-hidden">
      {/* Slider */}
      <Slider ref={sliderRef} {...settings}>
        {banners.map((b, i) => (
          <div key={i} className="px-2">
            <img
              src={b}
              alt={`banner-${i}`}
              className="w-full h-[420px] object-cover rounded-xl"
              loading="lazy"
            />
          </div>
        ))}
      </Slider>

      {/* Nút điều hướng trái phải */}
      <button
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10"
        onClick={() => sliderRef.current?.slickPrev()}
      >
        <ChevronLeft size={28} />
      </button>

      <button
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10"
        onClick={() => sliderRef.current?.slickNext()}
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
}

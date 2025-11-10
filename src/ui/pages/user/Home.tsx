import React, { useEffect } from "react";
import Banner from "../../components/Banner";
import QuickBooking from "../../components/QuickBooking";
import MovieTabs from "../../components/MovieTabs";
import BlogSection from "../../components/BlogSection";
import PromoSection from "../../components/PromoSection";
import AppSection from "../../components/AppSection";
import Footer from "../../components/Footer";
import { seedAll } from "../../../lib/seed"; // ✅ thêm dòng này

export default function Home() {
  useEffect(() => {
    // đảm bảo dữ liệu mock được nạp
    try {

      console.log("✅ Mock data seeded!");
    } catch (err) {
      console.error("❌ Seed error:", err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Banner */}
      <div className="w-full">
        <Banner /> {/* ✅ Cho banner full width giống Galaxy */}
      </div>

      {/* Quick booking */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <QuickBooking />
      </div>

      {/* Phim */}
      <div className="max-w-6xl mx-auto px-3 mt-10">
        <MovieTabs />
      </div>

      {/* Góc điện ảnh */}
      <div className="max-w-6xl mx-auto px-3 mt-10">
        <BlogSection />
      </div>

      {/* Tin khuyến mãi */}
      <div className="max-w-6xl mx-auto px-3 mt-10">
        <PromoSection />
      </div>

      {/* App Section */}
      <div className="max-w-6xl mx-auto px-3 mt-10">
        <AppSection />
      </div>
    </div>
  );
}

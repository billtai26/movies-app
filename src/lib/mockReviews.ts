// src/lib/mockReviews.ts
export type Review = {
  id: number;
  title: string;
  excerpt: string;
  heroImage: string;
  rating?: number;
  views?: number;
  likes?: number;
  body: Array<{ type: 'p' | 'img'; content: string }>;
};

export const REVIEWS: Review[] = [
  {
    id: 1,
    title:
      "[Review] Cục Vàng Của Ngoại: Việt Hương – Hồng Đào Lấy Nước Mắt Khán Giả",
    excerpt:
      "Sau thành công trăm tỷ của Chị Dâu, đạo diễn Khương Ngọc tiếp tục phát huy thế mạnh ở dòng phim tâm lý gia đình với Cục Vàng Của Ngoại.",
    heroImage:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1600",
    rating: 8.4,
    views: 2450,
    likes: 457,
    body: [
      {
        type: 'p',
        content:
          "Lấy bối cảnh đời thường gần gũi, Cục Vàng Của Ngoại diễn tả những lát cắt cảm xúc chân thật về tình thân nhiều thế hệ. Phim chú trọng vào nhịp kể ấm áp, đồng thời vẫn giữ được sự hài hước duyên dáng đặc trưng.",
      },
      {
        type: 'img',
        content: 'https://picsum.photos/800/450?random=401',
      },
      {
        type: 'p',
        content:
          "Diễn xuất của Việt Hương và Hồng Đào tạo nên trục cảm xúc vững chắc, giúp câu chuyện chạm tới trái tim khán giả. Hình ảnh và âm nhạc đều tiết chế, hỗ trợ tốt cho cảm giác mộc mạc của bộ phim.",
      },
      {
        type: 'img',
        content: 'https://picsum.photos/800/500?random=402',
      },
    ],
  },
  {
    id: 2,
    title: "[Review] Tron Ares: Mãn Nhãn Với Công Nghệ Vượt Thời Đại",
    excerpt:
      "Bữa tiệc thị giác với thế giới số rực rỡ, mang đậm phong cách Tron.",
    heroImage:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600",
    rating: 7.9,
    views: 1200,
    likes: 352,
    body: [
      {
        type: 'p',
        content:
          "Từ tạo hình đến bối cảnh, Tron Ares mang lại cảm giác hiện đại và bứt phá. Nhịp phim nhanh, giàu năng lượng, phù hợp với khán giả yêu thích công nghệ và hành động.",
      },
      { type: 'img', content: 'https://picsum.photos/800/450?random=403' },
      {
        type: 'p',
        content:
          "Một vài điểm trừ đến từ tuyến nhân vật phụ chưa được khai thác sâu, nhưng tổng thể vẫn là một trải nghiệm điện ảnh giải trí chất lượng.",
      },
    ],
  },
  {
    id: 3,
    title:
      "[Review] Từ Chiến Trên Không: Phim Việt Xuất Sắc Top Đầu 2025!",
    excerpt:
      "Tác phẩm hành động không chiến hiếm thấy của điện ảnh Việt với quy mô tham vọng.",
    heroImage:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1600",
    rating: 8.7,
    views: 2616,
    likes: 2616,
    body: [
      {
        type: 'p',
        content:
          "Các cảnh không chiến được dàn dựng ấn tượng, âm thanh mạnh mẽ, nâng tầm trải nghiệm rạp. Kịch bản mạch lạc, dễ theo dõi, đẩy cảm xúc tốt ở hồi ba.",
      },
      { type: 'img', content: 'https://picsum.photos/800/450?random=404' },
      {
        type: 'p',
        content:
          "Dù còn vài chỗ vụng về trong lời thoại, phim vẫn xứng đáng là cột mốc đáng nhớ của phim Việt đầu 2025.",
      },
    ],
  },
];

export function getReviewById(id: string | number): Review | null {
  const num = typeof id === 'string' ? Number(id) : id;
  if (!num || Number.isNaN(num)) return null;
  return REVIEWS.find((r) => r.id === num) ?? null;
}
// Simple mock blog API with async fetch and error handling
// Supports ids used across list components (1-8) and can be extended later.

export type BlogAuthor = { name: string; avatar?: string };
export type Blog = {
  id: string;
  title: string;
  excerpt?: string;
  heroImage: string;
  body: Array<{ type: 'p' | 'img'; content: string }>;
  rating?: number;
  author?: BlogAuthor;
  date?: string; // ISO string
};

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Minimal sample dataset; can be replaced with real API later.
const blogs: Blog[] = [
  {
    id: '1',
    title: 'Điều Gì Sẽ Xảy Ra Trong Predator: Badlands?',
    excerpt:
      'Phim mới nhất thuộc series Predator chính thức quay trở lại màn ảnh rộng với tên gọi Predator: Badlands.',
    heroImage:
      'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200',
    body: [
      {
        type: 'p',
        content:
          'Predator: Badlands mở ra chương mới đầy kịch tính, với bối cảnh khắc nghiệt và những cuộc săn đuổi nghẹt thở.',
      },
      {
        type: 'img',
        content: 'https://picsum.photos/960/540?random=301',
      },
      {
        type: 'p',
        content:
          'Bài viết phân tích các chi tiết mới, đồng thời dự đoán hướng đi của thương hiệu trong những phần tiếp theo.',
      },
    ],
    rating: 8.3,
    author: { name: 'Only Cinema' },
    date: '2025-01-10',
  },
  {
    id: '2',
    title: 'Top Phim Hay Dịp Cuối Năm 2025',
    excerpt:
      'Những tác phẩm xuất sắc của điện ảnh Việt Nam và thế giới trong mùa lễ hội.',
    heroImage:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1200',
    body: [
      { type: 'p', content: 'Danh sách tổng hợp các phim đáng chú ý cuối năm.' },
      { type: 'img', content: 'https://picsum.photos/960/540?random=302' },
      { type: 'p', content: 'Gợi ý lịch xem và cảm nhận nhanh từng tựa phim.' },
    ],
    rating: 8.0,
    author: { name: 'Only Cinema' },
    date: '2025-11-01',
  },
  {
    id: '3',
    title:
      'Final Destination Bloodlines: Hé Lộ Bí Mật Về Vòng Lặp Tử Thần',
    excerpt:
      'Bloodlines hé lộ bí ẩn chớp nhoáng về cái bẫy chết chóc của Tử Thần.',
    heroImage:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200',
    body: [
      { type: 'p', content: 'Những cái chết được dàn dựng tinh vi và ám ảnh.' },
      { type: 'img', content: 'https://picsum.photos/960/540?random=303' },
      { type: 'p', content: 'Phân tích mối liên hệ với các phần trước.' },
    ],
    rating: 7.6,
    author: { name: 'Only Cinema' },
    date: '2025-10-12',
  },
  // IDs xuất hiện trong BlogSection
  {
    id: '5',
    title: 'Điều Gì Sẽ Xảy Ra Trong Predator: Badlands?',
    excerpt: 'Bản mở rộng về bối cảnh và nhân vật trong Badlands.',
    heroImage:
      'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1400',
    body: [
      { type: 'p', content: 'Tổng quan dự án và các giả thuyết nổi bật.' },
      { type: 'img', content: 'https://picsum.photos/960/540?random=304' },
    ],
    rating: 8.3,
    author: { name: 'Only Cinema' },
    date: '2025-01-10',
  },
  { id: '6', title: 'Top Phim Hay Dịp Cuối Năm 2025', excerpt: 'Gợi ý chọn phim mùa lễ.', heroImage: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1200', body: [{ type: 'p', content: 'Danh sách nổi bật mùa cuối năm.' }], rating: 8.0, author: { name: 'Only Cinema' }, date: '2025-11-01' },
  { id: '7', title: 'Final Destination Bloodlines: Hé Lộ Bí Mật Về Vòng Lặp Tử Thần', excerpt: 'Giải mã chuỗi sự kiện ám ảnh.', heroImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200', body: [{ type: 'p', content: 'Phân tích sự trở lại của thương hiệu.' }], rating: 7.6, author: { name: 'Only Cinema' }, date: '2025-10-12' },
  { id: '8', title: 'Bùi Thạc Chuyên Và 11 Năm Tâm Huyết Với Địa Đạo: Mặt Trời Trong Bóng Tối', excerpt: 'Hậu trường và câu chuyện sản xuất.', heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200', body: [{ type: 'p', content: 'Góc nhìn đạo diễn và ekip.' }], rating: 8.5, author: { name: 'Only Cinema' }, date: '2025-09-20' },
];

export async function fetchBlogById(id: string): Promise<Blog> {
  await wait(150);
  const blog = blogs.find((b) => b.id === id);
  if (!blog) {
    const err = new Error('BLOG_NOT_FOUND');
    // Attach code for UI to branch on
    // @ts-ignore
    err.code = 'BLOG_NOT_FOUND';
    throw err;
  }
  return blog;
}

export async function listBlogSummaries() {
  await wait(120);
  return blogs.map((b) => ({ id: b.id, title: b.title, heroImage: b.heroImage, excerpt: b.excerpt }));
}
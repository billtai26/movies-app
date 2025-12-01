import React from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBlogById, Blog } from "../../../lib/mockBlogs";
import SidebarMovieCard from "../../components/SidebarMovieCard";
import QuickBooking from "../../components/QuickBooking";
import { api } from "../../../lib/api";

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = React.useState<Blog | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error("INVALID_ID");
        const data = await fetchBlogById(String(id));
        if (!cancelled) setBlog(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.code || e?.message || "ERROR");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [nowPlaying, setNowPlaying] = React.useState<any[]>([])
  React.useEffect(()=>{
    api.listMovies({ status: 'now_showing', limit: 4 })
      .then((res:any)=>{
        const list = res?.movies || res || []
        const mapped = (Array.isArray(list) ? list : []).map((m:any)=> ({ id: m._id || m.id, name: m.title || m.name, img: (m as any).posterUrl || m.poster, rating: (m as any).averageRating ?? m.rating }))
        setNowPlaying(mapped.slice(0,3))
      })
      .catch(()=> setNowPlaying([]))
  },[])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-64 bg-gray-200 rounded" />
          <div className="h-8 w-96 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="border-l-4 border-orange-500 pl-3 mb-4">
          <h1 className="text-xl font-semibold">Không tìm thấy bài blog</h1>
        </div>
        <p className="text-gray-600 mb-4">ID không hợp lệ hoặc bài viết đã bị xóa.</p>
        <Link to="/blogs" className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Quay lại danh sách</Link>
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
          <Link to="/blogs" className="hover:text-blue-600">Blog điện ảnh</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Chi tiết</span>
        </div>

        {/* Tiêu đề theo mẫu */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{blog.title}</h1>
        {blog.excerpt && (
          <p className="text-sm text-gray-600 mb-3">{blog.excerpt}</p>
        )}

        {/* Meta: tác giả / ngày / rating */}
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-3">
          {blog.author?.name && <span>Tác giả: {blog.author.name}</span>}
          {blog.date && <span>• Ngày đăng: {new Date(blog.date).toLocaleDateString()}</span>}
          {typeof blog.rating === 'number' && <span>• Rating: {blog.rating.toFixed(1)}</span>}
        </div>

        {/* Ảnh lớn đầu bài */}
        <img src={blog.heroImage} alt={blog.title} className="w-full h-auto rounded-md mb-4" />

        {/* Nội dung bài */}
        <div className="prose max-w-none">
          {blog.body.map((b, idx) => (
            b.type === 'p' ? (
              <p key={idx} className="text-gray-800 leading-relaxed mb-4">{b.content}</p>
            ) : (
              <img key={idx} src={b.content} alt="blog" className="w-full rounded-md my-3" />
            )
          ))}
        </div>
      </div>

      {/* Cột phải: mua vé nhanh + phim đang chiếu */}
      <aside className="space-y-6">
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-orange-500 text-white text-center py-2 font-medium">Mua Vé Nhanh</div>
          <div className="p-3">
            <QuickBooking stacked className="shadow-none border-none" />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">PHIM ĐANG CHIẾU</h3>
          <div className="space-y-3">
            {nowPlaying.map((p) => (
              <SidebarMovieCard key={p.id} movie={p} />
            ))}
          </div>
          <Link to="/movies" className="block mx-auto mt-4 w-fit border border-orange-500 text-orange-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition">Xem thêm →</Link>
        </div>
      </aside>
    </div>
  );
}

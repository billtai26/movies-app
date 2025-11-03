import React, { useState, useEffect, useRef } from "react";
import { Star, Mail, Phone, Lock, Calendar } from "lucide-react";
import { useAuth } from "../../../store/auth";
import { useNotifications, NotificationContainer } from "../../components/Notification";

export default function Profile() {
  const { updateAvatar, updateProfile, getCurrentUser, name, email, avatar, phone, dob } = useAuth();
  const { notifications, addNotification, removeNotification } = useNotifications();
  
  // ==============================
  // USER DATA FROM AUTH STORE
  // ==============================
  const [user, setUser] = useState(() => {
    // Get current user data from auth store
    const currentUser = getCurrentUser();
    if (currentUser) {
      return {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || "0786121131",
        dob: currentUser.dob || "2004-12-14",
        password: "********",
        spent: 2400000,
        goal: 6000000,
        rank: "Star",
        avatar: currentUser.avatar || "",
      };
    }
    
    // Fallback data if no user is logged in
    return {
      name: "Nguyễn Quang Dũng",
      email: "dungquangnguyen118@gmail.com",
      phone: "0786121131",
      dob: "2004-12-14",
      password: "********",
      spent: 2400000,
      goal: 6000000,
      rank: "Star",
      avatar: "",
    };
  });

  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(user));
  }, [user]);

  // Sync with auth store when user data changes
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(prev => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || prev.phone,
        dob: currentUser.dob || prev.dob,
        avatar: currentUser.avatar || prev.avatar,
      }));
    }
  }, [name, email, avatar, phone, dob, getCurrentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'error',
          title: 'Lỗi tải ảnh',
          message: 'Kích thước ảnh không được vượt quá 5MB'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'error',
          title: 'Lỗi tải ảnh',
          message: 'Vui lòng chọn file ảnh hợp lệ'
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarUrl = reader.result as string;
        setUser((prev: any) => ({ ...prev, avatar: avatarUrl }));
        updateAvatar(avatarUrl);
        
        addNotification({
          type: 'success',
          title: 'Cập nhật ảnh đại diện',
          message: 'Ảnh đại diện đã được cập nhật thành công!'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = () => {
    // Update auth store with new profile data
    updateProfile(user.name, user.email, user.phone, user.dob);
    
    addNotification({
      type: 'success',
      title: 'Cập nhật thông tin',
      message: 'Thông tin cá nhân đã được cập nhật thành công!'
    });
  };

  const watched = [
    {
      title: "Avatar: The Way of Water",
      poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    },
    {
      title: "Tron: Ares",
      poster: "https://image.tmdb.org/t/p/w500/eoK7my1iJ8C8f5DJKV93cbvXQeH.jpg",
    },
    {
      title: "Spider-Man: Across the Spider-Verse",
      poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    },
    {
      title: "Zootopia",
      poster: "https://image.tmdb.org/t/p/w500/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg",
    },
  ];

  const rankMilestones = ["Member", "Star", "Gold", "Diamond"];

  return (
    <>
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
      {/* LEFT PANEL */}
      <div className="card text-center p-4 sm:p-6 flex flex-col items-center">
        {/* Avatar */}
        <div
          className="relative group mb-4 cursor-pointer"
          onClick={triggerFileSelect}
        >
          <img
            src={user.avatar || "https://i.pravatar.cc/150?img=12"}
            alt="Avatar"
            className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-sky-500 avatar-fix transition hover:opacity-80"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition">
            <span className="text-white text-sm font-medium">Đổi ảnh</span>
          </div>
        </div>

        {/* Info */}
        <h2 className="text-base sm:text-lg font-bold text-brand truncate max-w-full">{user.name}</h2>
        <p className="text-xs sm:text-sm text-gray-400 mb-3">🎬 Thành viên Cinesta</p>

        {/* Rank Progress */}
        <div className="w-full max-w-xs sm:max-w-sm mt-2 relative">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            {rankMilestones.map((r) => (
              <span key={r} className="text-xs">{r}</span>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative bg-gray-700 h-2 rounded-full">
            <div
              className="h-2 bg-sky-500 rounded-full transition-all"
              style={{
                width: `${(user.spent / user.goal) * 100}%`,
              }}
            ></div>

            {/* Milestone dots */}
            {rankMilestones.map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-300 dark:bg-gray-500 rounded-full"
                style={{
                  left: `${(i / (rankMilestones.length - 1)) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              ></div>
            ))}
          </div>

          <div className="text-xs mt-1 text-gray-400">
            <span className="hidden sm:inline">{user.spent.toLocaleString()}đ / {user.goal.toLocaleString()}đ</span>
            <span className="sm:hidden">{Math.round((user.spent / user.goal) * 100)}%</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 text-yellow-400">
          <Star size={14} fill="gold" /> 2 Stars
        </div>

        <hr className="my-3 w-full border-gray-700" />

        {/* Rewards */}
        <div className="text-left w-full">
          <h3 className="font-semibold mb-1 text-pink-400 text-sm sm:text-base">
            💎 Chặng đường Cinesta Rewards
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-3">
            Chinh phục 4 cấp độ thành viên để nhận quà và quyền lợi đặc biệt từ Cinesta!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {rankMilestones.map((rank) => (
              <div
                key={rank}
                className="text-center border rounded-xl py-2 dark:border-gray-600"
              >
                <div className="text-sm sm:text-lg">🏅</div>
                <div className="text-xs sm:text-sm">{rank}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="card p-4 sm:p-6">
        {/* Watched Movies */}
        <div className="mb-4 sm:mb-6">
          <h3 className="font-semibold text-brand mb-1 text-sm sm:text-base">
            🎥 Bộ sưu tập phim đã xem
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-3">
            Bạn đã sưu tầm được {watched.length}/5 tem phim. Cố gắng xem thêm để mở khóa phần thưởng đặc biệt!
          </p>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
            {watched.map((film) => (
              <div
                key={film.title}
                className="min-w-[100px] sm:min-w-[130px] relative group rounded-lg overflow-hidden shadow-sm hover:scale-105 transition"
              >
                <img
                  src={film.poster}
                  alt={film.title}
                  className="w-full h-32 sm:h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs text-white text-center py-1 opacity-0 group-hover:opacity-100 transition">
                  <span className="hidden sm:inline">{film.title}</span>
                  <span className="sm:hidden">📽️</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600 text-xs sm:text-sm mb-4 overflow-x-auto">
          {[
            { key: "history", label: "Lịch Sử Giao Dịch" },
            { key: "profile", label: "Thông Tin Cá Nhân" },
            { key: "notifications", label: "Thông Báo" },
            { key: "gifts", label: "Quà Tặng" },
            { key: "policy", label: "Chính Sách" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-2 sm:px-4 py-2 relative whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-sky-500 font-semibold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.key === "history" && "📊"}
                {tab.key === "profile" && "👤"}
                {tab.key === "notifications" && "🔔"}
                {tab.key === "gifts" && "🎁"}
                {tab.key === "policy" && "📋"}
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                icon={<UserIcon />}
                name="name"
                value={user.name}
                onChange={handleChange}
                placeholder="Họ và tên"
              />
              <Input
                icon={<Calendar size={18} className="text-gray-400" />}
                name="dob"
                type="date"
                value={user.dob}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                icon={<Mail size={18} className="text-gray-400" />}
                name="email"
                value={user.email}
                onChange={handleChange}
                placeholder="Email"
              />
              <Input
                icon={<Phone size={18} className="text-gray-400" />}
                name="phone"
                value={user.phone}
                onChange={handleChange}
                placeholder="Số điện thoại"
              />
            </div>

            <Input
              icon={<Lock size={18} className="text-gray-400" />}
              name="password"
              type="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
            />

            <div className="text-right">
              <button 
                className="btn-primary px-4 sm:px-6 py-2 text-sm sm:text-base"
                onClick={handleUpdateProfile}
              >
                Cập nhật
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

const Input = ({ icon, ...props }: any) => (
  <div className="relative w-full">
    {/* Icon ở bên trái */}
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </div>

    {/* Ô nhập liệu */}
    <input
      {...props}
      className="w-full bg-transparent border border-gray-600 rounded-lg py-2 sm:py-2.5 pl-10 pr-3 text-xs sm:text-sm text-gray-100
                 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
    />
  </div>
);


const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="text-gray-400 w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
    />
  </svg>
);

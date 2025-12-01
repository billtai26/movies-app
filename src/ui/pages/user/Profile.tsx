import React, { useState, useEffect, useRef } from "react";
import { Star, Mail, Phone, Lock, Calendar, Check, User as UserIcon } from "lucide-react";
import { useAuth } from "../../../store/auth";
import { api } from "../../../lib/api";
// Import component Loading (đảm bảo đường dẫn đúng với file bạn đã tạo)
import LoadingOverlay from "../../components/LoadingOverlay";

export default function Profile() {
  // Lấy hàm cập nhật store để đồng bộ Navbar sau khi sửa profile
  const { setSession, name: authName, email: authEmail, avatar: authAvatar, role: authRole } = useAuth(); 
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State quản lý loading

  // State lưu trữ thông tin user
  const [user, setUser] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    dob: "", // Format: YYYY-MM-DD
    password: "",
    loyaltyPoints: 0,
    avatar: "",
    role: "",
  });

  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- 1. FETCH DATA TỪ API KHI MOUNT ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const data = await api.getProfile();
        if (data) {
          setUser({
            _id: data._id,
            name: data.username,
            email: data.email,
            phone: data.phone || "",
            dob: data.dob ? data.dob.split('T')[0] : "",
            loyaltyPoints: data.loyaltyPoints || 0,
            avatar: data.avatarUrl || "",
            role: data.role,
            password: "",
          });
          setSession({
            token: localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : "",
            name: data.username,
            email: data.email,
            avatar: data.avatarUrl,
            role: data.role,
          });
        } else {
          setUser(u => ({
            ...u,
            name: authName || "",
            email: authEmail || "",
            avatar: authAvatar || "",
            role: authRole || "",
          }));
        }
      } catch (error) {
        setUser(u => ({
          ...u,
          name: authName || "",
          email: authEmail || "",
          avatar: authAvatar || "",
          role: authRole || "",
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [setSession, authName, authEmail, authAvatar, authRole]);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // --- 2. XỬ LÝ UPLOAD AVATAR ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true); // Bật loading

      // Gọi API upload
      const updatedUser = await api.updateAvatarUser(file);
      
      // Cập nhật state cục bộ
      const newAvatarUrl = updatedUser.avatarUrl;
      setUser((prev) => ({ ...prev, avatar: newAvatarUrl }));
      
      // Cập nhật global store
      setSession({ 
        token: JSON.parse(localStorage.getItem('auth')!).token,
        avatar: newAvatarUrl 
      });
      
      showSuccessToast("Cập nhật avatar thành công! 🎉");
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      alert("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsLoading(false); // Tắt loading
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // --- 3. XỬ LÝ CẬP NHẬT THÔNG TIN ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true); // Bật loading khi lưu thông tin

      // Chuẩn bị dữ liệu gửi đi
      const payload = {
        username: user.name,
        phone: user.phone,
        dob: user.dob,
      };

      // Gọi API Update
      const updatedData = await api.updateProfileUser(payload);

      // Thông báo thành công
      showSuccessToast("Cập nhật thông tin thành công! ✅");
      
      // Đồng bộ store
      setSession({
        token: JSON.parse(localStorage.getItem('auth')!).token,
        name: updatedData.username,
        email: updatedData.email
      });

    } catch (error: any) {
      console.error("Lỗi update profile:", error);
      alert(error.response?.data?.errors || "Có lỗi xảy ra khi cập nhật.");
    } finally {
      setIsLoading(false); // Tắt loading
    }
  };

  // --- LOGIC TÍNH RANK ---
  const currentPoints = user.loyaltyPoints; 
  const goalPoints = 10000;
  const rankMilestones = ["Member", "Star", "Gold", "Diamond"];
  
  let currentRank = "Member";
  if (currentPoints > 1000) currentRank = "Star";
  if (currentPoints > 5000) currentRank = "Gold";
  if (currentPoints > 10000) currentRank = "Diamond";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 lg:px-12">
      {/* LEFT PANEL */}
      <div className="card text-center p-6 flex flex-col items-center">
        {/* Avatar */}
        <div
          className="relative group mb-4 cursor-pointer"
          onClick={triggerFileSelect}
        >
          <img
            src={user.avatar || "https://i.pravatar.cc/150?img=12"}
            alt="Avatar"
            className="w-36 h-36 rounded-full border-4 border-sky-500 object-cover transition hover:opacity-80"
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
        <h2 className="text-lg font-bold text-brand">{user.name}</h2>
        <p className="text-sm text-gray-400 mb-3">🎬 Thành viên Only Cinema</p>

        {/* Rank Progress */}
        <div className="w-full max-w-sm mt-2 relative">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            {rankMilestones.map((r) => (
              <span key={r} className={r === currentRank ? "text-sky-400 font-bold" : ""}>{r}</span>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative bg-gray-700 h-2 rounded-full">
            <div
              className="h-2 bg-sky-500 rounded-full transition-all"
              style={{
                width: `${Math.min((currentPoints / goalPoints) * 100, 100)}%`,
              }}
            ></div>
          </div>

          <div className="text-xs mt-1 text-gray-400">
            {currentPoints.toLocaleString()} điểm / {goalPoints.toLocaleString()} điểm
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 text-yellow-400">
          <Star size={14} fill="gold" /> {currentRank}
        </div>

        <hr className="my-3 w-full border-gray-700" />
        
        {/* Rewards */}
        <div className="text-left w-full">
          <h3 className="font-semibold mb-1 text-pink-400">
            💎 Quyền lợi thành viên
          </h3>
          <p className="text-sm text-gray-400 mb-3">
             Điểm tích lũy hiện tại: <span className="text-white font-bold">{user.loyaltyPoints}</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {rankMilestones.map((rank) => (
              <div
                key={rank}
                className={`text-center border rounded-xl py-2 ${rank === currentRank ? 'border-sky-500 bg-sky-900/20' : 'border-gray-600'}`}
              >
                <div className="text-lg">🏅</div>
                <div className="text-sm">{rank}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="card p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-600 text-sm mb-4 overflow-x-auto">
          {[
            { key: "profile", label: "Thông Tin Cá Nhân" },
            { key: "history", label: "Lịch Sử Giao Dịch" },
            { key: "password", label: "Đổi mật khẩu" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 relative whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-sky-500 font-semibold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                icon={<UserIcon className="w-5 h-5" />}
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

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                icon={<Mail size={18} className="text-gray-400" />}
                name="email"
                value={user.email}
                disabled // Email không cho sửa
                className="opacity-70 cursor-not-allowed"
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

            <div className="text-right mt-4">
              <button 
                onClick={handleUpdateProfile}
                className="btn-primary px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}
        
        {/* Tab Đổi mật khẩu (Placeholder) */}
        {activeTab === "password" && (
            <div className="space-y-4">
                 <p className="text-sm text-gray-400">Tính năng đổi mật khẩu đang phát triển...</p>
            </div>
        )}
        
        {/* Tab Lịch sử (Placeholder) */}
        {activeTab === "history" && (
            <div className="space-y-4">
                 <p className="text-sm text-gray-400">Lịch sử giao dịch sẽ hiển thị ở đây...</p>
            </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check size={20} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ✅ Component LoadingOverlay được đặt ở cuối cùng */}
      <LoadingOverlay isLoading={isLoading} message="Đang xử lý..." />
      
    </div>
  );
}

// Component Input giữ nguyên
const Input = ({ icon, className, ...props }: any) => (
  <div className="relative w-full">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </div>
    <input
      {...props}
      className={`w-full bg-transparent border border-gray-600 rounded-lg py-2.5 pl-10 pr-3 text-sm text-gray-100
                 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition ${className || ''}`}
    />
  </div>
);

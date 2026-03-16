import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  User, Edit2, Save, X,
  Camera, Lock, LogOut, Shield, Clock, CheckCircle,
  AlertCircle, Loader2, UserPlus
} from "lucide-react";
import { BACKEND_URL } from "../../utils/constants.jsx";

const ProfileAdmin = ({ user, onLogout, onUpdateProfile }) => {
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "info");
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    avatar: user?.avatar || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");

  // OTP 2FA state
  const [otpEnabled, setOtpEnabled] = useState(() => {
    const settings = JSON.parse(localStorage.getItem("otp_settings") || "{}");
    return settings[user?.email] === true;
  });

  const handleToggleOtp = () => {
    const newVal = !otpEnabled;
    setOtpEnabled(newVal);
    const settings = JSON.parse(localStorage.getItem("otp_settings") || "{}");
    settings[user?.email] = newVal;
    localStorage.setItem("otp_settings", JSON.stringify(settings));
  };

  const isSuperAdmin = user?.email === "buixu4ns0n@gmail.com";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage({ ok: false, text: "Vui lòng nhập tên và email!" });
      return;
    }
    setIsSaving(true);
    try {
      if (onUpdateProfile) await onUpdateProfile(formData);
      setMessage({ ok: true, text: "Cập nhật hồ sơ thành công!" });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ ok: false, text: err.message || "Cập nhật thất bại!" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ ok: false, text: "Vui lòng điền đầy đủ thông tin!" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ ok: false, text: "Mật khẩu mới không khớp!" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ ok: false, text: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
      return;
    }
    setIsSaving(true);
    try {
      setMessage({ ok: true, text: "Đổi mật khẩu thành công!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ ok: false, text: err.message || "Đổi mật khẩu thất bại!" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      setMessage({ ok: false, text: "Vui lòng nhập đầy đủ email và họ tên!" });
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/auth/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newAdminEmail.trim(), full_name: newAdminName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tạo tài khoản thất bại!");
      setMessage({ ok: true, text: `Tạo tài khoản ${newAdminEmail} thành công! Mật khẩu mặc định: 123` });
      setNewAdminEmail("");
      setNewAdminName("");
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 text-slate-900 shadow-lg border border-slate-100">
        <div className="flex items-end gap-6">
          <div className="relative">
            <img
              src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=1e293b&color=fff&size=120`}
              alt="Avatar"
              className="w-32 h-32 rounded-2xl border-4 border-blue-200 shadow-lg object-cover"
            />
            {isEditing && (
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all">
                <Camera size={18} />
              </button>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1 text-slate-900">{formData.name}</h1>
            <p className="text-slate-600 flex items-center gap-2 mb-3">
              <Shield size={16} /> Ban Quản Lý Ký Túc Xá
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Tham gia từ {new Date(user?.createdAt || Date.now()).toLocaleDateString("vi-VN")}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={14} /> Tài khoản đã xác minh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${message.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.ok ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70 transition-opacity">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200 bg-white rounded-t-2xl">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === "info" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <User size={18} /> Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === "security" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Lock size={18} /> Bảo mật
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("create-admin")}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === "create-admin" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <UserPlus size={18} /> Tạo tài khoản
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 p-8">
        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Họ và tên</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${isEditing ? "border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none" : "border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${isEditing ? "border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none" : "border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Số điện thoại</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${isEditing ? "border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none" : "border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Địa chỉ</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all ${isEditing ? "border-slate-200 bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none" : "border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"}`}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {isEditing ? (
                <>
                  <button onClick={() => { setIsEditing(false); setFormData({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", address: user?.address || "", avatar: user?.avatar || "" }); }}
                    className="px-6 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all">
                    Hủy
                  </button>
                  <button onClick={handleSaveProfile} disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                    {isSaving ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : <><Save size={16} /> Lưu thay đổi</>}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg">
                  <Edit2 size={16} /> Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mật khẩu hiện tại</label>
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Nhập mật khẩu hiện tại..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mật khẩu mới</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Nhập mật khẩu mới..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Xác nhận mật khẩu mới</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Xác nhận mật khẩu mới..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm transition-all" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {/* OTP toggle */}
              <button onClick={handleToggleOtp}
                className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${otpEnabled ? "bg-blue-600" : "bg-slate-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${otpEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </div>
                <span className="font-medium">Xác thực OTP khi đăng nhập</span>
              </button>
              <button onClick={handleChangePassword} disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Đang cập nhật...</> : <><Lock size={16} /> Đổi mật khẩu</>}
              </button>
            </div>
          </div>
        )}

        {/* Create Admin Tab */}
        {activeTab === "create-admin" && isSuperAdmin && (
          <div className="space-y-6 max-w-md">
            <p className="text-sm text-slate-500">
              Tạo tài khoản Admin mới với mật khẩu mặc định là <span className="font-bold text-slate-700">123</span>.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Họ và tên</label>
              <input type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="Nhập họ và tên..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="Nhập email tài khoản..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm transition-all" />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={handleCreateAdmin} disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Đang tạo...</> : <><UserPlus size={16} /> Tạo tài khoản</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Đăng xuất</h3>
            <p className="text-sm text-slate-500">Kết thúc phiên làm việc hiện tại</p>
          </div>
          <button onClick={onLogout}
            className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-red-200">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;

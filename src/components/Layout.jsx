import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, Bell, User, Lock } from "lucide-react";
import { ADMIN_ROUTES, STUDENT_ROUTES } from "../router/index.js";
import { UserRole } from "../utils/types.js";
import { BACKEND_URL } from "../utils/constants.jsx";
import * as LucideIcons from "lucide-react";

/**
 * Layout Component — sidebar dùng useNavigate để cập nhật URL thật
 * Props: user, onLogout, children
 */
const Layout = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = user.role === UserRole.ADMIN ? ADMIN_ROUTES : STUDENT_ROUTES;

  const getIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent size={20} className="shrink-0" /> : null;
  };

  // Current active route from URL
  const activePath = location.pathname;
  const activeItem = menuItems.find((item) => item.path === activePath) || menuItems[0];

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"
          } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20 shadow-xl`}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center">
              <img src={`${BACKEND_URL}/uploads/logo/logo.png`} alt="Logo" className="h-10 w-10 mr-4" />
              <span className="font-bold text-xl tracking-tight text-blue-400">
                Dormitory<br /><span className="text-white">Unis TLU</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 overflow-y-auto px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${activePath === item.path
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              title={!isSidebarOpen ? item.label : ""}
            >
              {getIconComponent(item.icon)}
              {isSidebarOpen && <span className="ml-3 font-medium truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 hover:bg-red-500 rounded-xl transition-all text-slate-400 hover:text-white"
            title={!isSidebarOpen ? "Đăng xuất" : ""}
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"
          }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 capitalize">
            {activeItem?.label || ""}
          </h2>
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                title="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{unreadCount} thông báo mới</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <Bell size={32} className="opacity-30 mb-2" />
                        <p className="text-sm">Không có thông báo mới</p>
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer last:border-0"
                        >
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {notif.content}
                          </p>
                          <p className="text-xs text-slate-400 mt-1.5">
                            {new Date(notif.created_at).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 font-medium">
                {user.role === UserRole.ADMIN ? "Ban Quản Lý" : "Sinh Viên"}
              </p>
            </div>
            
            {/* Avatar with Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="relative hover:opacity-80 transition-opacity"
                title="Hồ sơ"
              >
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.name}&background=1e293b&color=fff`
                  }
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm cursor-pointer"
                />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {user.role === UserRole.ADMIN ? "Ban Quản Lý" : "Sinh Viên"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile-admin");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <User size={16} />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => {
                      navigate("/profile-admin?tab=security");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 flex items-center gap-2 border-t border-slate-100"
                  >
                    <Lock size={16} />
                    Tài khoản
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 transition-colors text-sm font-medium text-red-600 flex items-center gap-2 border-t border-slate-100"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

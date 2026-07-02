import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, Bell, User, Lock, FileText, MessageSquare, Megaphone, AlertTriangle, X as XIcon } from "lucide-react";
import { ADMIN_ROUTES, STUDENT_ROUTES } from "../router/index.js";
import { UserRole } from "../utils/types.js";
import { BACKEND_URL } from "../utils/constants.jsx";
import * as LucideIcons from "lucide-react";
import logoImg from "../assets/images/logo.png";
import { useNotifications } from "../contexts/NotificationContext.jsx";

/**
 * Layout Component — sidebar dùng useNavigate để cập nhật URL thật
 * Props: user, onLogout, children
 */
const Layout = ({ user, onLogout, children }) => {
  // Trên mobile mặc định đóng sidebar, desktop mặc định mở
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth >= 1024);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [hasModalOpen, setHasModalOpen] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // MutationObserver để tự động phát hiện khi có Modal mở lên
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasActiveModal = Array.from(document.querySelectorAll(".fixed.inset-0")).some((el) => {
        // Loại trừ overlay của sidebar mobile (có class lg:hidden và z-10)
        if (el.classList.contains("lg:hidden") && el.classList.contains("z-10")) {
          return false;
        }
        // Nhận diện qua background đen hoặc backdrop blur của modal overlay
        return el.className.includes("bg-black") || el.className.includes("bg-gray-900") || el.className.includes("backdrop-blur");
      });
      setHasModalOpen(hasActiveModal);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Đóng sidebar khi resize xuống mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { notifications, adminAlerts, unreadCount, clearUnread, clearAdminAlerts, highPriorityToasts, dismissHighPriorityToast } = useNotifications();

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN || user.role === UserRole.STAFF;

  const getRoleDisplayName = () => {
    if (user.role === UserRole.SUPER_ADMIN) return "Super Admin";
    if (user.role === UserRole.STAFF) return user.staff_title || "Cán bộ quản lý";
    if (user.role === UserRole.ADMIN) return "Ban Quản Lý";
    return "Sinh Viên";
  };

  // Dropdown items: sinh viên thấy notifications, admin thấy adminAlerts
  const dropdownItems = isAdmin ? adminAlerts : notifications;

  const menuItems = isAdmin ? ADMIN_ROUTES : STUDENT_ROUTES;

  const getIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent size={20} className="shrink-0" /> : null;
  };

  // Lấy route đang hoạt động từ URL
  const activePath = location.pathname;
  
  // Tìm kiếm mục menu đang active (bao gồm cả các submenu con)
  let activeItem = null;
  for (const item of menuItems) {
    if (item.submenu) {
      const submenuItem = item.submenu.find((sub) => sub.path === activePath);
      if (submenuItem) {
        activeItem = submenuItem;
        break;
      }
    }
    if (item.path === activePath) {
      activeItem = item;
      break;
    }
  }
  if (!activeItem) activeItem = menuItems[0];

  // Tự động mở submenu nếu đường dẫn hiện tại thuộc submenu đó
  useEffect(() => {
    for (const item of menuItems) {
      if (item.submenu) {
        const isSubmenuActive = item.submenu.some((sub) => sub.path === activePath);
        if (isSubmenuActive) {
          setOpenSubmenu(item.id);
          break;
        }
      }
    }
  }, [activePath, menuItems]);

  const toggleSubmenu = (itemId) => {
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
  };

  // Kiểm tra xem một mục menu chính hoặc các mục con của nó có đang hoạt động hay không
  const isMenuItemActive = (item) => {
    if (item.submenu) {
      return item.submenu.some((sub) => sub.path === activePath);
    }
    return item.path === activePath;
  };

  // Xử lý sự kiện click vào mục menu
  const handleMenuItemClick = (item) => {
    if (item.submenu) {
      // Nếu có submenu, chuyển đổi trạng thái đóng mở và điều hướng đến mục đầu tiên của submenu
      const isCurrentlyOpen = openSubmenu === item.id;
      setOpenSubmenu(isCurrentlyOpen ? null : item.id);
      
      // Điều hướng đến mục đầu tiên của submenu
      if (!isCurrentlyOpen && item.submenu.length > 0) {
        navigate(item.submenu[0].path);
      }
    } else {
      // Không có submenu, điều hướng trực tiếp
      navigate(item.path);
    }
  };

  // Đóng dropdown thông báo và menu cá nhân khi click ra ngoài
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
      {/* Overlay mobile — tap ngoài để đóng sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0 lg:w-20"}
          bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full shadow-xl ${hasModalOpen ? "z-0" : "z-20"}`}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center">
              <img src={logoImg} alt="Logo" className="h-10 w-10 mr-4" />
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
            <div key={item.id}>
              {/* Main menu item */}
              <button
                onClick={() => handleMenuItemClick(item)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  isMenuItemActive(item)
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title={!isSidebarOpen ? item.label : ""}
              >
                <div className="flex items-center">
                  {getIconComponent(item.icon)}
                  {isSidebarOpen && <span className="ml-3 font-medium truncate">{item.label}</span>}
                </div>
                {isSidebarOpen && item.submenu && (
                  <LucideIcons.ChevronDown
                    size={16}
                    className={`transition-transform ${openSubmenu === item.id ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {/* Submenu items */}
              {item.submenu && isSidebarOpen && openSubmenu === item.id && (
                <div className="ml-6 mt-1 space-y-1 pl-2 border-l-2 border-slate-700">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => navigate(subItem.path)}
                      className={`w-full flex items-center p-2.5 rounded-lg transition-all text-sm ${
                        activePath === subItem.path
                          ? "bg-blue-500/30 text-blue-200 border border-blue-400/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {getIconComponent(subItem.icon)}
                      <span className="ml-3 font-medium truncate">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
        className={`flex-1 transition-all duration-300 min-w-0 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* Header */}
        <header className={`bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 shadow-sm transition-all ${hasModalOpen ? "z-0" : "z-10"}`}>
          {/* Hamburger — luôn hiện trên mobile */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Marquee text — ẩn trên mobile */}
          <div className="flex-1 overflow-hidden mx-4 hidden md:block">
            <div className="flex items-center gap-3 animate-marquee-single whitespace-nowrap">
              <img src={logoImg} alt="Logo" className="h-8 w-8 shrink-0" />
              <span className="text-base font-bold text-slate-700">
                Chào mừng đến trường Đại học Thủy Lợi - 175 Tây Sơn, Đống Đa, Hà Nội
              </span>
              <img src={logoImg} alt="Logo" className="h-8 w-8 shrink-0" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) clearUnread();
                }}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                title="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown kiểu Facebook */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">Thông báo</h3>
                    {isAdmin && adminAlerts.length > 0 && (
                      <button onClick={clearAdminAlerts}
                        className="text-xs text-blue-600 hover:underline font-semibold">
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                    {dropdownItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Bell size={32} className="opacity-20 mb-2" />
                        <p className="text-sm">Không có thông báo mới</p>
                      </div>
                    ) : dropdownItems.slice(0, 10).map((item, idx) => {
                      const isAdminAlert = isAdmin;
                      const alertIcon = isAdminAlert
                        ? item.type === "new_registration" ? <FileText size={16} className="text-blue-600" /> : <MessageSquare size={16} className="text-amber-600" />
                        : <Megaphone size={16} className="text-blue-600" />;
                      const alertBg = isAdminAlert
                        ? item.type === "new_registration" ? "bg-blue-50" : "bg-amber-50"
                        : "bg-blue-50";
                      const title = isAdminAlert
                        ? item.type === "new_registration"
                          ? `Hồ sơ mới: ${item.data?.student_name || ""}`
                          : `Phản ánh mới: ${item.data?.category || ""}`
                        : item.title;
                      const desc = isAdminAlert
                        ? item.type === "new_registration"
                          ? `${item.data?.student_id || ""} — ${item.data?.faculty || ""}`
                          : (item.data?.content || "").substring(0, 80)
                        : (item.content || "").substring(0, 80);
                      const time = new Date(item.timestamp || item.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

                      return (
                        <div key={idx}
                          onClick={() => {
                            setShowNotifications(false);
                            if (isAdminAlert) {
                              const target = item.type === "new_registration" ? "/registrations" : "/feedback";
                              if (location.pathname === target) {
                                window.location.reload();
                              } else {
                                navigate(target);
                              }
                            } else {
                              navigate("/home");
                            }
                          }}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                          <div className={`w-9 h-9 rounded-full ${alertBg} flex items-center justify-center shrink-0 mt-0.5`}>
                            {alertIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{desc}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 mt-1">{time}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(isAdmin ? "/notifications" : "/home");
                      }}
                      className="w-full py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 font-medium">
                {getRoleDisplayName()}
              </p>
            </div>
            
            {/* Avatar with Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="relative p-1.5 bg-white rounded-full hover:opacity-80 transition-opacity shadow-sm"
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
                      {getRoleDisplayName()}
                    </p>
                  </div>
                  {isAdmin && (
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
                  )}
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
        <div className="p-4 md:p-6 xl:p-8 w-full">
          {children}
        </div>
      </main>

      {/* ── High Priority Toast Container (Admin only) ── */}
      {isAdmin && highPriorityToasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
          {highPriorityToasts.map(toast => (
            <div key={toast.id}
              className="bg-white border border-red-200 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span className="font-bold text-red-600 text-sm">Phản ánh nghiêm trọng</span>
                </div>
                <button onClick={() => dismissHighPriorityToast(toast.id)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <XIcon size={14} />
                </button>
              </div>
              {/* Summary */}
              {toast.data?.content && (
                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                  {toast.data.content}
                </p>
              )}
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {toast.data?.sentiment && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    toast.data.sentiment === "Positive" ? "bg-green-50 text-green-700 border-green-200" :
                    toast.data.sentiment === "Negative" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}>
                    {toast.data.sentiment === "Positive" ? "Tích cực" : toast.data.sentiment === "Negative" ? "Tiêu cực" : "Trung lập"}
                  </span>
                )}
                {toast.data?.priority && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    {toast.data.priority}
                  </span>
                )}
                {toast.data?.emotion && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                    {toast.data.emotion}
                  </span>
                )}
              </div>
              {/* Timestamp */}
              <p className="text-[10px] text-slate-400">
                {new Date(toast.timestamp || toast.data?.created_at || Date.now()).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Layout;

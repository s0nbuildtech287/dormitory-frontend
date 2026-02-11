import React from "react";
import { Menu, LogOut } from "lucide-react";
import { ADMIN_ROUTES, STUDENT_ROUTES } from "../router/index.js";
import { UserRole } from "../utils/types.js";
import { BACKEND_URL } from "../utils/constants.jsx";
import * as LucideIcons from "lucide-react";

/**
 * Layout Component
 * Main layout wrapper with sidebar navigation
 * 
 * Props:
 * - user: Current user object
 * - onLogout: Logout handler
 * - activeTab: Currently active tab/route
 * - setActiveTab: Function to set active tab
 * - children: Page content
 */
const Layout = ({ user, onLogout, activeTab, setActiveTab, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Get menu items based on user role
  const menuItems = user.role === UserRole.ADMIN ? ADMIN_ROUTES : STUDENT_ROUTES;

  /**
   * Get icon component by name
   */
  const getIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent size={20} className="shrink-0" /> : null;
  };

  /**
   * Handle menu item click
   */
  const handleMenuClick = (itemId) => {
    setActiveTab(itemId);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
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
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${
                activeTab === item.id
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

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
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
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 capitalize">
            {activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 font-medium">
                {user.role === UserRole.ADMIN ? "Ban Quản Lý" : "Sinh Viên"}
              </p>
            </div>
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user.name}&background=1e293b&color=fff`
              }
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm"
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

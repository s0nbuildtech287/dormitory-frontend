import React from "react";
import { UserRole } from "../utils/types.js";
import { LayoutDashboard, Users, Home, FileText, CreditCard, Bell, MessageSquare, LogOut, Menu, UserCircle } from "lucide-react";

const Layout = ({ user, onLogout, activeTab, setActiveTab, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const adminMenu = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "registrations", label: "Hồ sơ đăng ký", icon: FileText },
    { id: "rooms", label: "Quản lý phòng", icon: Home },
    { id: "students", label: "Sinh viên & Hợp đồng", icon: Users },
    { id: "billing", label: "Hóa đơn", icon: CreditCard },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "feedback", label: "Phản ánh", icon: MessageSquare },
  ];

  const studentMenu = [
    { id: "profile", label: "Thông tin cá nhân", icon: UserCircle },
    { id: "contract", label: "Hợp đồng KTX", icon: FileText },
    { id: "bills", label: "Theo dõi hóa đơn", icon: CreditCard },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "feedback", label: "Gửi phản ánh", icon: MessageSquare },
  ];

  const menuItems = user.role === UserRole.ADMIN ? adminMenu : studentMenu;

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50">
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20 shadow-xl`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-blue-400">DormiManage</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${
                activeTab === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="ml-3 font-medium truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center p-3 hover:bg-red-500 rounded-xl transition-all text-slate-400 hover:text-white">
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab.replace("-", " ")}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 font-medium">{user.role === UserRole.ADMIN ? "Ban Quản Lý" : "Sinh Viên"}</p>
            </div>
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm" />
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

import React, { useState } from "react";
import Layout from "./components/Layout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import RegistrationManagement from "./pages/RegistrationManagement.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import RoomManagement from "./pages/RoomManagement.jsx";
import StudentManagement from "./pages/StudentManagement.jsx";
import BillingManagement from "./pages/BillingManagement.jsx";
import NotificationManagement from "./pages/NotificationManagement.jsx";
import FeedbackManagement from "./pages/FeedbackManagement.jsx";
import AIChatBot from "./components/AIChatBot.jsx";
import { UserRole } from "./utils/types.js";
import { MOCK_ADMIN, MOCK_STUDENT } from "./utils/constants.jsx";
import { KeyRound, ShieldCheck, User as UserIcon, LogIn, Lock } from "lucide-react";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [loginRole, setLoginRole] = useState(UserRole.STUDENT);
  const [idInput, setIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!idInput.trim()) {
      setError(loginRole === UserRole.ADMIN ? "Vui lòng nhập tài khoản quản lý" : "Vui lòng nhập mã sinh viên");
      return;
    }
    if (!passwordInput.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setIsLoginLoading(true);
    setError(null);

    setTimeout(() => {
      if (loginRole === UserRole.ADMIN) {
        // Updated admin credentials as requested: admin / 123
        if (idInput === "admin" && passwordInput === "123") {
          setUser(MOCK_ADMIN);
          setActiveTab("dashboard");
        } else {
          setError("Tài khoản hoặc mật khẩu quản lý không chính xác (Thử: admin / 123)");
        }
      } else {
        // Student login: any password for demo, but check ID format
        if (idInput.toUpperCase().startsWith("SV") || idInput.length >= 5) {
          setUser({ ...MOCK_STUDENT, studentId: idInput.toUpperCase() });
          setActiveTab("profile");
        } else {
          setError("Mã sinh viên không hợp lệ (Ví dụ: SV2024001)");
        }
      }
      setIsLoginLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setIdInput("");
    setPasswordInput("");
    setError(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full"></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20">
                <ShieldCheck size={48} className="text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold mb-1">DormiManage</h1>
              <p className="text-slate-300 opacity-80 text-sm">Hệ thống quản lý Ký túc xá thông minh</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => {
                  setLoginRole(UserRole.STUDENT);
                  setError(null);
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginRole === UserRole.STUDENT ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Sinh viên
              </button>
              <button
                onClick={() => {
                  setLoginRole(UserRole.ADMIN);
                  setError(null);
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginRole === UserRole.ADMIN ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Ban quản lý
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{loginRole === UserRole.ADMIN ? "Tài khoản quản lý" : "Mã số sinh viên"}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{loginRole === UserRole.ADMIN ? <KeyRound size={20} /> : <UserIcon size={20} />}</div>
                  <input
                    type="text"
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    placeholder={loginRole === UserRole.ADMIN ? "admin" : "Ví dụ: SV2024001"}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${error ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-2xl outline-none focus:ring-4 transition-all font-medium`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${error ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-2xl outline-none focus:ring-4 transition-all font-medium`}
                  />
                </div>
                {error && <p className="mt-2 text-xs text-red-500 font-medium animate-in slide-in-from-top-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoginLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 mt-2 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-70"
              >
                {isLoginLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <LogIn size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-400">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Hệ thống quản lý giáo dục chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (user.role === UserRole.ADMIN) {
      switch (activeTab) {
        case "dashboard":
          return <AdminDashboard />;
        case "registrations":
          return <RegistrationManagement />;
        case "rooms":
          return <RoomManagement />;
        case "students":
          return <StudentManagement />;
        case "billing":
          return <BillingManagement />;
        case "notifications":
          return <NotificationManagement />;
        case "feedback":
          return <FeedbackManagement />;
        default:
          return <AdminDashboard />;
      }
    } else {
      return <StudentDashboard user={user} tab={activeTab} />;
    }
  };

  return (
    <>
      <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="animate-in fade-in duration-500">{renderContent()}</div>
      </Layout>
      <AIChatBot />
    </>
  );
};

export default App;

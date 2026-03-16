import React, { useState, useRef, useEffect } from "react";
import { KeyRound, ShieldCheck, Lock, LogIn, Smartphone } from "lucide-react";
import { UserRole } from "../../utils/types.js";
import { adminLogin, saveAuthToken, saveCurrentUser } from "../../api/apiAuth.js";

const LoginPage = ({ onLogin }) => {
  const [loginRole, setLoginRole] = useState(UserRole.STUDENT);
  const [idInput, setIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP inline state
  const [showOtp, setShowOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(null);
  const [pendingAuth, setPendingAuth] = useState(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (showOtp) otpRefs.current[0]?.focus();
  }, [showOtp]);

  const handleOtpInput = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError(null);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
    if (e.key === "Enter") handleVerifyOtp();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length < 6) { setOtpError("Vui lòng nhập đủ 6 số!"); return; }
    try {
      const res = await fetch("http://localhost:1234/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingAuth.user.email, code }),
      });
      const data = await res.json();
      if (!data.success) {
        setOtpError("Mã OTP không đúng hoặc đã hết hạn. Thử lại!");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 0);
        return;
      }
      // Lưu session 24h
      const sessions = JSON.parse(localStorage.getItem("otp_sessions") || "{}");
      sessions[pendingAuth.user.email] = Date.now();
      localStorage.setItem("otp_sessions", JSON.stringify(sessions));

      saveAuthToken(pendingAuth.token);
      saveCurrentUser(pendingAuth.user);
      onLogin(pendingAuth.user);
    } catch {
      setOtpError("Lỗi kết nối. Thử lại!");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Nếu đang ở bước OTP thì verify
    if (showOtp) { handleVerifyOtp(); return; }

    if (!idInput.trim()) {
      setError(loginRole === UserRole.ADMIN ? "Vui lòng nhập tài khoản quản lý" : "Vui lòng nhập mã sinh viên");
      return;
    }
    if (!passwordInput.trim()) { setError("Vui lòng nhập mật khẩu"); return; }

    setIsLoading(true);
    setError(null);

    try {
      const data = await adminLogin(idInput, passwordInput);
      if (data.success) {
        const user = { ...data.data.user, name: data.data.user.full_name || data.data.user.name };
        const otpSettings = JSON.parse(localStorage.getItem("otp_settings") || "{}");
        const isOtpEnabled = otpSettings[user.email] === true;

        // Kiểm tra session 24h - nếu đã xác thực OTP trong 24h thì bỏ qua
        const sessions = JSON.parse(localStorage.getItem("otp_sessions") || "{}");
        const lastVerified = sessions[user.email];
        const within24h = lastVerified && (Date.now() - lastVerified) < 24 * 60 * 60 * 1000;

        if (isOtpEnabled && !within24h) {
          setPendingAuth({ token: data.data.token, user });
          setOtpDigits(["", "", "", "", "", ""]);
          setOtpError(null);
          // Gửi OTP về email
          await fetch("http://localhost:1234/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });
          setShowOtp(true);
        } else {
          saveAuthToken(data.data.token);
          saveCurrentUser(user);
          onLogin(user);
        }
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.message || "Lỗi kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (role) => {
    setLoginRole(role);
    setError(null);
    setIdInput("");
    setPasswordInput("");
    setShowOtp(false);
    setPendingAuth(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20">
              <ShieldCheck size={48} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold mb-1">Dormitory Unis</h1>
            <p className="text-slate-300 opacity-80 text-sm">Hệ thống quản lý Ký túc xá thông minh</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Role Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button onClick={() => toggleRole(UserRole.STUDENT)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginRole === UserRole.STUDENT ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Sinh viên
            </button>
            <button onClick={() => toggleRole(UserRole.ADMIN)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginRole === UserRole.ADMIN ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Ban quản lý
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email/ID */}
            <div className={showOtp ? "opacity-50 pointer-events-none" : ""}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                {loginRole === UserRole.ADMIN ? "Tài khoản quản lý" : "Email sinh viên"}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {loginRole === UserRole.ADMIN ? <KeyRound size={20} /> : <ShieldCheck size={20} />}
                </div>
                <input type="text" value={idInput} onChange={e => setIdInput(e.target.value)}
                  placeholder={loginRole === UserRole.ADMIN ? "admin" : "email@student.edu.vn"}
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${error ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-2xl outline-none focus:ring-4 transition-all font-medium`}
                  disabled={isLoading || showOtp} />
              </div>
            </div>

            {/* Password */}
            <div className={showOtp ? "opacity-50 pointer-events-none" : ""}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={20} /></div>
                <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${error ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-2xl outline-none focus:ring-4 transition-all font-medium`}
                  disabled={isLoading || showOtp} />
              </div>
              {error && !showOtp && <p className="mt-2 text-xs text-red-500 font-medium animate-in slide-in-from-top-1">{error}</p>}
            </div>

            {/* OTP inline - hiện sau khi login thành công */}
            {showOtp && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-slate-500 mb-3">
                  Mã OTP đã được gửi đến <span className="font-semibold text-slate-800">{idInput}</span>
                </p>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <Smartphone size={14} /> Mã xác thực OTP
                </label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otpDigits.map((d, i) => (
                    <input key={i} ref={el => otpRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleOtpInput(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`w-9 h-9 text-center text-base font-bold border-2 rounded-lg outline-none transition-all
                        ${d ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-800"}
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                    />
                  ))}
                </div>
                {otpError && <p className="mt-2 text-xs text-red-500 font-medium">{otpError}</p>}
                <button type="button" onClick={() => { setShowOtp(false); setPendingAuth(null); }}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  ← Quay lại
                </button>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white py-4 mt-2 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95">
              {isLoading
                ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>{showOtp ? "Xác nhận OTP" : "Đăng nhập"}</span><LogIn size={20} /></>
              }
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-400">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Hệ thống quản lý giáo dục chuyên nghiệp</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

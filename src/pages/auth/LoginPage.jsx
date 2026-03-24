import React, { useState, useRef, useEffect } from "react";
import { KeyRound, ShieldCheck, Lock, LogIn, Smartphone } from "lucide-react";
import { UserRole } from "../../utils/types.js";
import { adminLogin, saveAuthToken, saveCurrentUser } from "../../api/apiAuth.js";
import ktxBg from "../../assets/images/ktx2.jpg";
import logoImg from "../../assets/images/logo.png";

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
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
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
    if (code.length < 6) {
      setOtpError("Vui lòng nhập đủ 6 số!");
      return;
    }
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
    if (showOtp) {
      handleVerifyOtp();
      return;
    }

    if (!idInput.trim()) {
      setError(loginRole === UserRole.ADMIN ? "Vui lòng nhập tài khoản quản lý" : "Vui lòng nhập mã sinh viên");
      return;
    }
    if (!passwordInput.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

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
        const within24h = lastVerified && Date.now() - lastVerified < 24 * 60 * 60 * 1000;

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
    <div className="min-h-screen flex">
      {/* Bên trái — ảnh full height, bo tròn góc phải */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden rounded-tr-3xl rounded-br-3xl">
        <img src={ktxBg} alt="Ký túc xá" className="w-full h-full object-cover" />
      </div>

      {/* Bên phải — form full height */}
      <div className="w-full lg:w-1/2 bg-sky-50 flex items-center justify-center p-10">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-sky-100 p-8">
          {/* Logo + tiêu đề */}
          <div className="bg-sky-100 rounded-xl px-6 py-5 text-center mb-6">
            <img src={logoImg} alt="Logo trường" className="w-14 h-14 object-contain mx-auto mb-2" />
            <h1 className="text-xl font-bold text-sky-800">Dormitory Unis</h1>
            <p className="text-sky-500 text-xs mt-0.5">Hệ thống quản lý Ký túc xá</p>
          </div>
          {/* Role Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => toggleRole(UserRole.STUDENT)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginRole === UserRole.STUDENT ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Sinh viên
            </button>
            <button
              onClick={() => toggleRole(UserRole.ADMIN)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginRole === UserRole.ADMIN ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Ban quản lý
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email/ID */}
            <div className={showOtp ? "opacity-50 pointer-events-none" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{loginRole === UserRole.ADMIN ? "Tài khoản quản lý" : "Email sinh viên"}</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{loginRole === UserRole.ADMIN ? <KeyRound size={18} /> : <ShieldCheck size={18} />}</div>
                <input
                  type="text"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  placeholder={loginRole === UserRole.ADMIN ? "admin" : "email@student.edu.vn"}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${error ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"} rounded-xl outline-none focus:ring-4 transition-all text-gray-800 placeholder-gray-400`}
                  disabled={isLoading || showOtp}
                />
              </div>
            </div>

            {/* Password */}
            <div className={showOtp ? "opacity-50 pointer-events-none" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${error ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"} rounded-xl outline-none focus:ring-4 transition-all text-gray-800 placeholder-gray-400`}
                  disabled={isLoading || showOtp}
                />
              </div>
              {error && !showOtp && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {/* OTP */}
            {showOtp && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-gray-500 mb-3">
                  Mã OTP đã được gửi đến <span className="font-semibold text-gray-800">{idInput}</span>
                </p>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  <Smartphone size={13} /> Mã xác thực OTP
                </label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-10 h-10 text-center text-base font-bold border-2 rounded-lg outline-none transition-all
                          ${d ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-50 text-gray-800"}
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                    />
                  ))}
                </div>
                {otpError && <p className="mt-2 text-xs text-red-500 font-medium">{otpError}</p>}
                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false);
                    setPendingAuth(null);
                  }}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Quay lại
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-100 transition-all active:scale-95 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{showOtp ? "Xác nhận OTP" : "Đăng nhập"}</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">© 2025 Dormitory Unis — Hệ thống quản lý giáo dục</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

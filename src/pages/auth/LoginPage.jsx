import { useState, useRef, useEffect } from "react";
import { Mail, Lock, LogIn, Smartphone } from "lucide-react";
import { adminLogin, saveAuthToken, saveCurrentUser } from "../../api/apiAuth.js";
import ktxImg from "../../assets/images/ktx.jpg";
import tlu1Img from "../../assets/images/tlu1.jpg";
import tlu2Img from "../../assets/images/tlu2.jpg";
import tluBg from "../../assets/images/tlu.jpg";
import logoImg from "../../assets/images/logo.png";

const SLIDE_IMAGES = [ktxImg, tlu1Img, tlu2Img];

const LoginPage = ({ onLogin }) => {
  const [idInput, setIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState(null);
  const [idError, setIdError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP inline state
  const [showOtp, setShowOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(null);
  const [pendingAuth, setPendingAuth] = useState(null);
  const otpRefs = useRef([]);

  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % SLIDE_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

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

  const validateId = (val) => {
    if (!val.trim()) return "Vui lòng nhập email";
    if (val.trim() === "admin") return null; // account đặc biệt
    if (!val.includes("@")) return "Email không hợp lệ, thiếu ký tự @";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Email không đúng định dạng";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (showOtp) { handleVerifyOtp(); return; }

    const idErr = validateId(idInput);
    const pwErr = !passwordInput.trim() ? "Vui lòng nhập mật khẩu" : null;
    setIdError(idErr);
    setPasswordError(pwErr);
    if (idErr || pwErr) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await adminLogin(idInput, passwordInput);
      if (data.success) {
        const user = { ...data.data.user, name: data.data.user.full_name || data.data.user.name };
        const isOtpEnabled = user.email === 'buixu4ns0n@gmail.com'; // OTP luôn bật cho superadmin
        const sessions = JSON.parse(localStorage.getItem("otp_sessions") || "{}");
        const lastVerified = sessions[user.email];
        const within7days = lastVerified && Date.now() - lastVerified < 7 * 24 * 60 * 60 * 1000;

        const isAdminNoOtp = user.role === 'ADMIN' && user.email !== 'buixu4ns0n@gmail.com';

        if (isOtpEnabled && !within7days && !isAdminNoOtp) {
          setPendingAuth({ token: data.data.token, user });
          setOtpDigits(["", "", "", "", "", ""]);
          setOtpError(null);
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
        setError(data.message || "Tài khoản hoặc mật khẩu không đúng");
      }
    } catch (err) {
      setError(err.message || "Lỗi kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundImage: `url(${tluBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="flex rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl relative z-10">

        {/* Bên trái — slideshow */}
        <div className="hidden md:flex md:w-[52%] shrink-0 bg-white p-2 lg:p-3 rounded-l-2xl overflow-hidden">
          <img
            key={slideIndex}
            src={SLIDE_IMAGES[slideIndex]}
            alt="Ký túc xá"
            className="w-full h-full object-cover rounded-xl transition-opacity duration-700"
          />
        </div>

        {/* Bên phải — form đăng nhập */}
        <div className="flex-1 bg-white flex flex-col justify-center px-5 py-6 lg:px-8 lg:py-10">
          {/* Logo + tiêu đề */}
          <div className="bg-sky-100 rounded-xl px-4 py-4 text-center mb-5">
            <img src={logoImg} alt="Logo trường" className="w-14 h-14 lg:w-20 lg:h-20 object-contain mx-auto mb-2" />
            <h1 className="text-sm lg:text-base font-bold text-sky-800">Ký túc xá trường Đại học Thuỷ Lợi</h1>
            <p className="text-sky-500 text-xs mt-0.5">Hệ thống Dormitory Unis</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / tài khoản */}
            <div className={showOtp ? "opacity-50 pointer-events-none" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email / Tài khoản</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  value={idInput}
                  onChange={(e) => { setIdInput(e.target.value); setIdError(null); }}
                  placeholder="email@tlu.edu.vn"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${idError ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "border-gray-300 focus:ring-blue-100 focus:border-blue-400"} rounded-xl outline-none focus:ring-4 transition-all text-gray-800 placeholder-gray-400 text-sm`}
                  disabled={isLoading || showOtp}
                />
              </div>
              {idError && <p className="mt-1.5 text-xs text-red-500 font-medium">{idError}</p>}
            </div>

            {/* Mật khẩu */}
            <div className={showOtp ? "opacity-50 pointer-events-none" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(null); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${passwordError ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "border-gray-300 focus:ring-blue-100 focus:border-blue-400"} rounded-xl outline-none focus:ring-4 transition-all text-gray-800 placeholder-gray-400 text-sm`}
                  disabled={isLoading || showOtp}
                />
              </div>
              {passwordError && <p className="mt-1.5 text-xs text-red-500 font-medium">{passwordError}</p>}
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
                    <input key={i} ref={(el) => (otpRefs.current[i] = el)}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-9 h-9 lg:w-10 lg:h-10 text-center text-base font-bold border-2 rounded-lg outline-none transition-all
                        ${d ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-50 text-gray-800"}
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                    />
                  ))}
                </div>
                {otpError && <p className="mt-2 text-xs text-red-500 font-medium">{otpError}</p>}
                <button type="button" onClick={() => { setShowOtp(false); setPendingAuth(null); }}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  ← Quay lại
                </button>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-100 transition-all active:scale-95">
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>{showOtp ? "Xác nhận OTP" : "Đăng nhập"}</span><LogIn size={18} /></>
              }
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">© 2025 Dormitory Unis — Hệ thống quản lý giáo dục</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

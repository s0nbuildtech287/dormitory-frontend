import { useState, useRef, useEffect } from "react";
import { Mail, Lock, LogIn, Smartphone, ClipboardList, KeyRound } from "lucide-react";
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
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

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
        const OTP_ACCOUNTS = ['buixu4ns0n@gmail.com', 'xu4ns0n@gmail.com'];
        const isOtpEnabled = OTP_ACCOUNTS.includes(user.email);
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
    <>
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
        <div className="flex-1 bg-white flex flex-col justify-center px-5 py-9 lg:px-8 lg:py-13">
          {/* Logo + tiêu đề */}
          <div className="bg-sky-100 rounded-xl px-4 py-5 text-center mb-6">
            <img src={logoImg} alt="Logo trường" className="w-16 h-16 lg:w-20 lg:h-20 object-contain mx-auto mb-2" />
            <h1 className="text-sm lg:text-base font-bold text-sky-800">Ký túc xá trường Đại học Thuỷ Lợi</h1>
            <p className="text-sky-500 text-xs mt-0.5">Hệ thống Dormitory Unis</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              {!showOtp && (
                <div className="text-right mt-1">
                  <button type="button" onClick={() => setShowForgot(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
                    Quên mật khẩu?
                  </button>
                </div>
              )}
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

            {/* Nút đăng ký */}
            <div className="relative flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <button type="button" onClick={() => setShowRegister(true)}
              className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm">
              <ClipboardList size={18} />
              Đăng ký thuê ký túc xá
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">© 2025 Dormitory Unis — Hệ thống quản lý giáo dục</p>
        </div>
      </div>
    </div>

    {/* Modal đăng ký */}
    {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    {/* Modal quên mật khẩu */}
    {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  );
};

// ── Modal quên mật khẩu ──────────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(0); // 0: nhập email + mk mới, 1: nhập OTP
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step === 1) otpRefs.current[0]?.focus();
  }, [step]);

  const handleOtpInput = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setErr(null);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "Enter") handleReset();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleSendOtp = async () => {
    setErr(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Email không hợp lệ!"); return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setErr("Mật khẩu mới phải có ít nhất 6 ký tự!"); return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Mật khẩu xác nhận không khớp!"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:1234/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) { setErr(data.message || "Gửi OTP thất bại!"); return; }
      setStep(1);
    } catch {
      setErr("Lỗi kết nối. Thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const code = otpDigits.join("");
    if (code.length < 6) { setErr("Vui lòng nhập đủ 6 số!"); return; }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("http://localhost:1234/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setErr(data.message || "Đặt lại mật khẩu thất bại!");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 0);
        return;
      }
      setDone(true);
    } catch {
      setErr("Lỗi kết nối. Thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-gray-800 placeholder-gray-400 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <KeyRound size={20} className="text-blue-600" />
            Quên mật khẩu
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all">✕</button>
        </div>

        <div className="px-6 py-6">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Đặt lại mật khẩu thành công!</h3>
              <p className="text-gray-500 text-sm mb-6">Bạn có thể đăng nhập với mật khẩu mới.</p>
              <button onClick={onClose} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all">
                Đăng nhập ngay
              </button>
            </div>
          ) : step === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Nhập email tài khoản và mật khẩu mới. Mã OTP sẽ được gửi đến email để xác nhận.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email tài khoản</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></div>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }}
                    placeholder="email@tlu.edu.vn" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></div>
                  <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setErr(null); }}
                    placeholder="Ít nhất 6 ký tự" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></div>
                  <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErr(null); }}
                    placeholder="Nhập lại mật khẩu mới" className={inputCls} />
                </div>
              </div>
              {err && <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
                  Hủy
                </button>
                <button onClick={handleSendOtp} disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Gửi mã OTP"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Mã OTP đã được gửi đến <span className="font-semibold text-gray-800">{email}</span>. Nhập mã để xác nhận đặt lại mật khẩu.
              </p>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  <Smartphone size={13} /> Mã xác thực OTP
                </label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otpDigits.map((d, i) => (
                    <input key={i} ref={(el) => (otpRefs.current[i] = el)}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-10 h-10 text-center text-base font-bold border-2 rounded-lg outline-none transition-all
                        ${d ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-50 text-gray-800"}
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                    />
                  ))}
                </div>
              </div>
              {err && <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setStep(0); setOtpDigits(["","","","","",""]); setErr(null); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
                  ← Quay lại
                </button>
                <button onClick={handleReset} disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Xác nhận"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Modal đăng ký ────────────────────────────────────────────────────────────
const FACULTIES = ["Công nghệ thông tin","Kinh tế","Xây dựng","Điện – Điện tử","Cơ khí","Quản trị kinh doanh","Ngôn ngữ học","Môi trường"];
const PRIORITY_OPTIONS = ["Hộ nghèo cận nghèo","Vùng sâu vùng xa","Con thương binh, liệt sỹ","Sinh viên khuyết tật","Lưu học sinh (Lào/Campuchia)"];

const STEPS = ["Thông tin cá nhân","Học vấn","Ưu tiên & Lý do"];

const RegisterModal = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    student_name: "", student_id: "", dob: "", gender: "Nam", cccd: "",
    phone_number: "", student_email: "",
    faculty: "", major: "", class: "", year: "", gpa: "",
    address: "", distance: "",
    priority_reasons: "", evidence_images: "", note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);

  const set = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr(null); };

  const validateStep = () => {
    if (step === 0) {
      if (!form.student_name.trim()) return "Vui lòng nhập họ và tên";
      if (!form.dob) return "Vui lòng nhập ngày sinh";
      if (!form.cccd.trim()) return "Vui lòng nhập số CCCD";
      if (!form.phone_number.trim()) return "Vui lòng nhập số điện thoại";
      if (!form.student_email.trim() || !form.student_email.includes("@")) return "Email sinh viên không hợp lệ";
      if (!form.address.trim()) return "Vui lòng nhập địa chỉ";
    }
    if (step === 1) {
      if (!form.faculty) return "Vui lòng chọn khoa";
      if (!form.year) return "Vui lòng chọn năm học";
    }
    return null;
  };

  const next = () => {
    const e = validateStep();
    if (e) { setErr(e); return; }
    setStep(s => s + 1);
  };

  const submit = async () => {
    setSubmitting(true); setErr(null);
    try {
      const res = await fetch("http://localhost:1234/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: parseInt(form.year) || 1,
          gpa: parseFloat(form.gpa) || 0,
          distance: parseInt(form.distance) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gửi đơn thất bại!");
      setDone(true);
    } catch (e) { setErr(e.message); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-gray-50 transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 font-bold text-gray-800 text-base">
              <ClipboardList size={20} className="text-blue-600" />
              Đăng ký thuê ký túc xá
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Đăng ký ngoài đợt chính thức — Ban quản lý sẽ xét duyệt</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all">✕</button>
        </div>

        {/* Stepper */}
        {!done && (
          <div className="flex items-center px-6 py-3 border-b border-gray-100 shrink-0 gap-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                  ${i < step ? "bg-blue-600 text-white" : i === step ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-100 text-gray-400"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${i === step ? "text-blue-600" : i < step ? "text-gray-600" : "text-gray-400"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-blue-300" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {done ? (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
              <h3 className="font-bold text-gray-800 text-xl mb-2">Gửi đơn thành công!</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">Ban quản lý sẽ xem xét hồ sơ và liên hệ với bạn qua email <span className="font-semibold text-gray-700">{form.student_email}</span> trong thời gian sớm nhất.</p>
              <button onClick={onClose} className="mt-6 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all">Đóng</button>
            </div>
          ) : step === 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Họ và tên <span className="text-red-500">*</span></label>
                <input name="student_name" value={form.student_name} onChange={set} placeholder="Nguyễn Văn A" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mã sinh viên</label>
                <input name="student_id" value={form.student_id} onChange={set} placeholder="2251160001" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ngày sinh <span className="text-red-500">*</span></label>
                <input name="dob" type="date" value={form.dob} onChange={set} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Giới tính <span className="text-red-500">*</span></label>
                <select name="gender" value={form.gender} onChange={set} className={inputCls}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Số CCCD <span className="text-red-500">*</span></label>
                <input name="cccd" value={form.cccd} onChange={set} placeholder="012345678901" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Số điện thoại <span className="text-red-500">*</span></label>
                <input name="phone_number" value={form.phone_number} onChange={set} placeholder="0987654321" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email sinh viên <span className="text-red-500">*</span></label>
                <input name="student_email" type="email" value={form.student_email} onChange={set} placeholder="email@sv.tlu.edu.vn" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Địa chỉ thường trú <span className="text-red-500">*</span></label>
                <input name="address" value={form.address} onChange={set} placeholder="Số nhà, đường, tỉnh/thành phố" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Khoảng cách đến trường (km)</label>
                <input name="distance" type="number" value={form.distance} onChange={set} placeholder="100" className={inputCls} />
              </div>
            </div>
          ) : step === 1 ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Khoa <span className="text-red-500">*</span></label>
                <select name="faculty" value={form.faculty} onChange={set} className={inputCls}>
                  <option value="">-- Chọn khoa --</option>
                  {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Chuyên ngành</label>
                <input name="major" value={form.major} onChange={set} placeholder="Kỹ thuật phần mềm" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Lớp</label>
                <input name="class" value={form.class} onChange={set} placeholder="64KTPM1" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Năm học <span className="text-red-500">*</span></label>
                <select name="year" value={form.year} onChange={set} className={inputCls}>
                  <option value="">-- Chọn năm --</option>
                  <option value="1">Năm 1</option>
                  <option value="2">Năm 2</option>
                  <option value="3">Năm 3</option>
                  <option value="4">Năm 4</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>GPA (để trống nếu năm 1)</label>
                <input name="gpa" type="number" step="0.01" min="0" max="4" value={form.gpa} onChange={set} placeholder="3.50" className={inputCls} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Đối tượng ưu tiên (nếu có)</label>
                <select name="priority_reasons" value={form.priority_reasons} onChange={set} className={inputCls}>
                  <option value="">-- Không có --</option>
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Link ảnh minh chứng (Google Drive)</label>
                <input name="evidence_images" value={form.evidence_images} onChange={set}
                  placeholder="https://drive.google.com/file/d/..."
                  className={inputCls} />
                <p className="text-xs text-gray-400 mt-1">Đảm bảo file được chia sẻ công khai (Anyone with the link)</p>
              </div>
              <div>
                <label className={labelCls}>Lý do đăng ký ngoài đợt <span className="text-red-500">*</span></label>
                <textarea name="note" value={form.note} onChange={set} rows={4}
                  placeholder="Mô tả lý do bạn cần đăng ký ngoài đợt chính thức (hoàn cảnh gia đình, chuyển trường, v.v.)..."
                  className={`${inputCls} resize-none`} />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
                <p className="font-semibold mb-1">⚠️ Lưu ý quan trọng</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Đơn đăng ký ngoài đợt sẽ được xét duyệt theo thứ tự ưu tiên</li>
                  <li>Kết quả sẽ được thông báo qua email trong vòng 3–5 ngày làm việc</li>
                  <li>Bạn cam kết các thông tin cung cấp là đúng sự thật</li>
                </ul>
              </div>
              {err && <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
            </div>
          )}

          {err && step < 2 && <p className="mt-3 text-xs text-red-500 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
        </div>

        {/* Footer */}
        {!done && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
            <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
              {step === 0 ? "Hủy" : "← Quay lại"}
            </button>
            {step < 2 ? (
              <button onClick={next} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all">
                Tiếp theo →
              </button>
            ) : (
              <button onClick={submit} disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Gửi đơn đăng ký
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

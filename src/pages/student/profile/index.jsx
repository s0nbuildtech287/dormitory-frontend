import { useEffect, useState } from "react";
import {
  User, Mail, Phone, MapPin, BookOpen, GraduationCap,
  Calendar, CreditCard, Home, Star, Shield, FileCheck,
  Hash, Users, Ruler, Building, Layers, Wifi,
  Trash2, Car, AlertCircle, CheckCircle, Clock, ChevronRight,
  ShieldAlert, ShieldCheck, ShieldX, MinusCircle
} from "lucide-react";
import { getStudentProfile, getStudentDisciplinary } from "../../../api/apiStudent.js";

const fmt    = (v) => (v != null && v !== "" ? v : "—");
const fmtDate  = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—");
const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} đ` : "—");
const fmtGPA   = (v) => (v != null ? Number(v).toFixed(2) : "—");

/* ── Dòng thông tin ── */
const InfoRow = ({ icon: Icon, label, value, accent, mono }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className={`p-2 rounded-lg shrink-0 ${accent ? "bg-blue-50" : "bg-slate-50"}`}>
      <Icon size={14} className={accent ? "text-blue-500" : "text-slate-400"} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 truncate ${accent ? "text-blue-700" : "text-slate-800"} ${mono ? "font-mono" : ""}`}>
        {fmt(value)}
      </p>
    </div>
  </div>
);

/* ── Card section ── */
const Section = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
      <Icon size={14} className="text-slate-400" />
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{title}</p>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

/* ── Badge điểm rèn luyện ── */
const ConductBadge = ({ score }) => {
  const s = Number(score ?? 100);
  const cfg = s >= 80
    ? { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Tốt" }
    : s >= 60
    ? { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Khá" }
    : { cls: "bg-rose-50 text-rose-700 border-rose-200", label: "Yếu" };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${cfg.cls}`}>
      <Shield size={12} /> {s} điểm — {cfg.label}
    </div>
  );
};

/* ── Badge trạng thái hợp đồng ── */
const ContractBadge = ({ status }) => {
  const cfg = {
    Active:     { cls: "bg-emerald-100 text-emerald-700", label: "Đang hiệu lực", icon: CheckCircle },
    Pending:    { cls: "bg-amber-100 text-amber-700",     label: "Chờ gán phòng", icon: Clock },
    Expired:    { cls: "bg-slate-100 text-slate-500",     label: "Hết hạn",        icon: AlertCircle },
    Terminated: { cls: "bg-rose-100 text-rose-700",       label: "Đã chấm dứt",   icon: AlertCircle },
  }[status] || { cls: "bg-slate-100 text-slate-600", label: status, icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

const StudentProfile = ({ user }) => {
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [disciplinary, setDisciplinary] = useState([]);

  useEffect(() => {
    Promise.all([
      getStudentProfile(),
      getStudentDisciplinary().catch(() => ({ data: [] })),
    ])
      .then(([profileRes, discRes]) => {
        setProfile(profileRes.data);
        setDisciplinary(Array.isArray(discRes.data) ? discRes.data : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[...Array(6)].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-rose-500">
      <AlertCircle size={40} />
      <p className="font-semibold">Không thể tải dữ liệu</p>
      <p className="text-sm text-slate-400">{error}</p>
    </div>
  );

  const name      = profile?.student_name || user?.full_name || "—";
  const studentId = profile?.snapshot_student_id || profile?.student_id || "—";
  const avatar    = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff&size=128`;
  const hasRoom     = !!profile?.room_number;
  const hasContract = !!profile?.contract_id;

  return (
    <div className="space-y-5">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 flex items-center gap-6 text-white shadow-lg shadow-blue-200">
        <img src={avatar} alt={name}
          className="w-20 h-20 rounded-2xl border-4 border-white/30 shadow-lg object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Sinh viên nội trú</p>
          <h2 className="text-2xl font-black truncate">{name}</h2>
          <p className="text-blue-200 font-mono text-sm mt-0.5">{studentId}</p>
        </div>
        <div className="shrink-0 text-right space-y-2">
          <ConductBadge score={user?.conduct_score} />
          {hasRoom && (
            <div className="flex items-center gap-1.5 text-blue-100 text-sm font-semibold justify-end">
              <Home size={14} /> Phòng {profile.building}-{profile.room_number}
            </div>
          )}
        </div>
      </div>

      {/* ── 2 cột chính: cá nhân + học tập ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* Cột trái — Thông tin cá nhân */}
        <Section title="Thông tin cá nhân" icon={User} className="h-full">
          <InfoRow icon={User}       label="Họ và tên"    value={name} />
          <InfoRow icon={Hash}       label="Mã sinh viên" value={studentId} accent mono />
          <InfoRow icon={Mail}       label="Email"        value={profile?.student_email || user?.email} />
          <InfoRow icon={Phone}      label="Điện thoại"   value={profile?.phone_number || profile?.snapshot_phone} />
          <InfoRow icon={Users}      label="Giới tính"    value={profile?.gender || profile?.snapshot_gender} />
          <InfoRow icon={Calendar}   label="Ngày sinh"    value={fmtDate(profile?.dob)} />
          <InfoRow icon={CreditCard} label="Số CCCD"      value={profile?.cccd || profile?.snapshot_cccd} mono />
          <InfoRow icon={MapPin}     label="Địa chỉ"      value={profile?.address} />
        </Section>

        {/* Cột phải — Thông tin học tập */}
        <Section title="Thông tin học tập" icon={BookOpen} className="h-full">
          <InfoRow icon={BookOpen}      label="Khoa"         value={profile?.faculty || profile?.snapshot_faculty} />
          <InfoRow icon={GraduationCap} label="Chuyên ngành" value={profile?.major} />
          <InfoRow icon={Hash}          label="Lớp"          value={profile?.class} />
          <InfoRow icon={Calendar}      label="Năm học"      value={profile?.year ? `Năm ${profile.year}` : null} accent />
          <InfoRow icon={Star}          label="GPA"          value={fmtGPA(profile?.gpa)} accent />
          <InfoRow icon={Ruler}         label="Khoảng cách đến trường" value={profile?.distance ? `${profile.distance} km` : null} />
        </Section>
      </div>

      {/* ── Card kỷ luật — chỉ hiện khi dưới 100 điểm ── */}
      {(() => {
        const score = Number(user?.conduct_score ?? 100);
        if (score >= 100) return null;

        const lost  = 100 - score;
        const scoreCfg = score >= 80
          ? { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Khá tốt", Icon: ShieldCheck }
          : score >= 60
          ? { bar: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   label: "Trung bình", Icon: ShieldAlert }
          : { bar: "bg-rose-500",    text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200",    label: "Yếu", Icon: ShieldX };

        const LEVEL_CFG = {
          "Nhắc nhở":          { cls: "bg-slate-100 text-slate-600",   dot: "bg-slate-400" },
          "Cảnh cáo":          { cls: "bg-amber-100 text-amber-700",   dot: "bg-amber-400" },
          "Phạt tiền":         { cls: "bg-orange-100 text-orange-700", dot: "bg-orange-400" },
          "Đình chỉ tạm thời": { cls: "bg-rose-100 text-rose-700",     dot: "bg-rose-500" },
          "Buộc thôi ở":       { cls: "bg-red-100 text-red-800",       dot: "bg-red-600" },
        };

        // Sắp xếp mới nhất trước, chỉ lấy 3 cái
        const recent = [...disciplinary]
          .sort((a, b) => new Date(b.violation_date || b.created_at) - new Date(a.violation_date || a.created_at))
          .slice(0, 3);

        return (
          <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${scoreCfg.border}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-slate-400" />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Điểm rèn luyện & Kỷ luật</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${scoreCfg.bg} ${scoreCfg.text} border ${scoreCfg.border}`}>
                {score}/100 — {scoreCfg.label}
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Thanh điểm */}
              <div className="lg:col-span-1 flex flex-col justify-center gap-3">
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Điểm hiện tại</span>
                  <span className={`font-black text-base ${scoreCfg.text}`}>{score}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${scoreCfg.bar}`} style={{ width: `${score}%` }} />
                </div>
                <p className="text-[10px] text-rose-400 font-semibold text-center">
                  -{lost} điểm bị trừ
                </p>
                {disciplinary.length > 3 && (
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Hiển thị {recent.length}/{disciplinary.length} vi phạm gần nhất
                  </p>
                )}
              </div>

              {/* Danh sách vi phạm gần nhất */}
              <div className="lg:col-span-2 space-y-2">
                {recent.map((d, i) => {
                  const lvl = LEVEL_CFG[d.level] || LEVEL_CFG["Nhắc nhở"];
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${lvl.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-800">{d.violation_type}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${lvl.cls}`}>{d.level}</span>
                          {d.penalty_points > 0 && (
                            <span className="text-[10px] font-bold text-rose-500">-{d.penalty_points} điểm</span>
                          )}
                        </div>
                        {d.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{d.description}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          {d.violation_date ? new Date(d.violation_date).toLocaleDateString("vi-VN") : "—"}
                          {d.status && <span className="ml-2 font-semibold">{d.status}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default StudentProfile;

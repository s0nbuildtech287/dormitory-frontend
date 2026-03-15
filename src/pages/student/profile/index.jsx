import { useEffect, useState } from "react";
import {
  User, Mail, Phone, MapPin, BookOpen, GraduationCap,
  Calendar, CreditCard, Home, Star, Shield, FileCheck,
  Hash, Users, Ruler, Award, Building, Layers, Wifi,
  Trash2, Car, Zap, Droplets, AlertCircle, CheckCircle,
  Clock, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { getStudentProfile } from "../../../api/apiStudent.js";

const fmt = (v) => (v != null && v !== "" ? v : "—");
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—");
const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} đ` : "—");
const fmtGPA = (v) => (v != null ? Number(v).toFixed(2) : "—");

const Row = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <div className="p-1.5 bg-slate-50 rounded-lg shrink-0 mt-0.5">
      <Icon size={13} className={accent ? "text-blue-500" : "text-slate-400"} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</p>
      <p className={`text-sm font-semibold truncate mt-0.5 ${accent ? "text-blue-700" : "text-slate-800"}`}>{fmt(value)}</p>
    </div>
  </div>
);

const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{title}</p>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

const ScoreBadge = ({ score }) => {
  const s = Number(score ?? 100);
  const cfg = s >= 80
    ? { cls: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "Tốt" }
    : s >= 60
    ? { cls: "text-amber-700 bg-amber-50 border-amber-200", label: "Khá" }
    : { cls: "text-rose-700 bg-rose-50 border-rose-200", label: "Yếu" };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${cfg.cls}`}>
      <Shield size={12} /> {s} điểm — {cfg.label}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = {
    "Chấp nhận": "bg-emerald-100 text-emerald-700",
    "Từ chối": "bg-rose-100 text-rose-700",
    "Chờ duyệt": "bg-amber-100 text-amber-700",
    "Active": "bg-blue-100 text-blue-700",
    "Pending": "bg-slate-100 text-slate-600",
    "Expired": "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
};

const AIReasoningBlock = ({ reasoning }) => {
  const [open, setOpen] = useState(false);
  if (!reasoning) return null;
  let parsed = reasoning;
  if (typeof reasoning === "string") {
    try { parsed = JSON.parse(reasoning); } catch { return null; }
  }
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider w-full text-left"
      >
        <Info size={11} /> Chi tiết chấm điểm AI
        {open ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
      </button>
      {open && (
        <div className="mt-2 bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-600">
          {parsed.basketName && <p><span className="font-semibold">Rổ:</span> {parsed.basketName}</p>}
          {parsed.formula && <p><span className="font-semibold">Công thức:</span> {parsed.formula}</p>}
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
              <p className="text-[10px] text-slate-400">Ưu tiên</p>
              <p className="font-bold text-slate-700">{parsed.priorityScore ?? "—"}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
              <p className="text-[10px] text-slate-400">Năm học</p>
              <p className="font-bold text-slate-700">{parsed.yearScore ?? "—"}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
              <p className="text-[10px] text-slate-400">GPA</p>
              <p className="font-bold text-slate-700">{parsed.gpaScore ?? "—"}</p>
            </div>
          </div>
          {parsed.priorityReason && <p className="text-slate-500 italic">{parsed.priorityReason}</p>}
        </div>
      )}
    </div>
  );
};

const StudentProfile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudentProfile()
      .then(res => setProfile(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const name = profile?.student_name || user?.full_name || "—";
  const studentId = profile?.snapshot_student_id || profile?.student_id || "—";
  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff&size=128`;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-rose-500">
        <AlertCircle size={40} />
        <p className="font-semibold">Lỗi tải dữ liệu</p>
        <p className="text-sm text-slate-500">{error}</p>
        <p className="text-xs text-slate-400">Vui lòng khởi động lại backend server và thử lại</p>
      </div>
    );
  }

  const hasRoom = !!profile?.room_number;
  const hasContract = !!profile?.contract_id;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Row 1: Avatar + Cá nhân + Học tập ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center text-center gap-3">
          <div className="relative">
            <img src={avatar} alt={name}
              className="w-20 h-20 rounded-2xl border-4 border-slate-100 shadow object-cover" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">{name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{studentId}</p>
          </div>
          {profile?.status && <StatusBadge status={profile.status} />}
          <ScoreBadge score={user?.conduct_score} />
        </div>

        {/* Thông tin cá nhân */}
        <Card title="Thông tin cá nhân" className="lg:col-span-2">
          <div className="grid grid-cols-2">
            <Row icon={User}       label="Họ và tên"     value={name} />
            <Row icon={Hash}       label="Mã sinh viên"  value={studentId} accent />
            <Row icon={Mail}       label="Email"         value={profile?.student_email || user?.email} />
            <Row icon={Phone}      label="Điện thoại"    value={profile?.phone_number || profile?.snapshot_phone} />
            <Row icon={Users}      label="Giới tính"     value={profile?.gender || profile?.snapshot_gender} />
            <Row icon={Calendar}   label="Ngày sinh"     value={fmtDate(profile?.dob)} />
            <Row icon={CreditCard} label="CCCD"          value={profile?.cccd || profile?.snapshot_cccd} />
            <Row icon={MapPin}     label="Địa chỉ"       value={profile?.address} />
          </div>
        </Card>

        {/* Thông tin học tập */}
        <Card title="Học tập">
          <Row icon={BookOpen}      label="Khoa"         value={profile?.faculty || profile?.snapshot_faculty} />
          <Row icon={GraduationCap} label="Chuyên ngành" value={profile?.major} />
          <Row icon={Hash}          label="Lớp"          value={profile?.class} />
          <Row icon={Calendar}      label="Năm học"      value={profile?.year ? `Năm ${profile.year}` : null} />
          <Row icon={Star}          label="GPA"          value={fmtGPA(profile?.gpa)} accent />
          <Row icon={Ruler}         label="Khoảng cách"  value={profile?.distance ? `${profile.distance} km` : null} />
        </Card>
      </div>

      {/* ── Row 2: Phòng ở + Hợp đồng + Hồ sơ đăng ký ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Phòng ở */}
        <Card title="Phòng ở hiện tại">
          {hasRoom ? (
            <>
              <Row icon={Home}     label="Số phòng"      value={`${profile.building}-${profile.room_number}`} accent />
              <Row icon={Building} label="Tòa nhà"       value={profile.building} />
              <Row icon={Layers}   label="Tầng"          value={profile.floor} />
              <Row icon={Users}    label="Sức chứa"      value={`${profile.current_occupancy}/${profile.capacity} người`} />
              <Row icon={Ruler}    label="Diện tích"     value={profile.area ? `${profile.area} m²` : null} />
              <Row icon={CreditCard} label="Giá phòng"   value={fmtMoney(profile.room_rent_price)} accent />
              <Row icon={Wifi}     label="Phí internet"  value={fmtMoney(profile.internet_fee)} />
              <Row icon={Trash2}   label="Phí rác"       value={fmtMoney(profile.garbage_fee)} />
              <Row icon={Car}      label="Phí gửi xe"    value={fmtMoney(profile.parking_fee)} />
              <Row icon={Calendar} label="Kiểm tra cuối" value={fmtDate(profile.last_inspection_date)} />
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Home size={28} className="text-slate-200" />
              Chưa được gán phòng
            </div>
          )}
        </Card>

        {/* Hợp đồng */}
        <Card title="Hợp đồng thuê phòng">
          {hasContract ? (
            <>
              <Row icon={FileCheck} label="Số hợp đồng"  value={profile.contract_number} accent />
              <Row icon={CheckCircle} label="Trạng thái" value={profile.contract_status} />
              <Row icon={Calendar}  label="Ngày bắt đầu" value={fmtDate(profile.start_date)} />
              <Row icon={Calendar}  label="Ngày kết thúc" value={fmtDate(profile.end_date)} />
              <Row icon={Clock}     label="Ngày ký"       value={fmtDate(profile.signed_at)} />
              <Row icon={CreditCard} label="Tiền thuê"   value={fmtMoney(profile.contract_rent_price)} accent />
              <Row icon={CreditCard} label="Tiền cọc"    value={fmtMoney(profile.deposit_amount)} />
              <Row icon={CheckCircle} label="Đã đóng cọc" value={profile.deposit_paid ? "Đã đóng" : "Chưa đóng"} />
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <FileCheck size={28} className="text-slate-200" />
              Chưa có hợp đồng
            </div>
          )}
        </Card>

        {/* Hồ sơ đăng ký */}
        <Card title="Hồ sơ đăng ký KTX">
          {profile ? (
            <>
              <Row icon={Calendar}  label="Ngày nộp"     value={fmtDate(profile.created_at)} />
              <Row icon={Calendar}  label="Ngày duyệt"   value={fmtDate(profile.reviewed_at)} />
              <Row icon={Award}     label="Điểm AI"       value={profile.ai_score != null ? `${profile.ai_score} điểm` : null} accent />
              <Row icon={AlertCircle} label="Gợi ý AI"   value={profile.ai_suggestion} />
              {profile.priority_reasons && (
                <div className="py-2.5 border-b border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Lý do ưu tiên</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{profile.priority_reasons}</p>
                </div>
              )}
              <AIReasoningBlock reasoning={profile.ai_reasoning} />
              {profile.note && (
                <div className="py-2.5">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ghi chú ban quản lý</p>
                  <p className="text-sm text-slate-500 italic leading-relaxed">{profile.note}</p>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <AlertCircle size={28} className="text-slate-200" />
              Chưa có hồ sơ đăng ký
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;

import React, { useState, useEffect, useRef } from "react";
import {
  Bell, Send, Search, Trash2, Users, User, Megaphone,
  AlertCircle, CheckCircle, Info, Clock, ChevronDown,
  Sparkles, X, RotateCcw, Filter, Calendar, Hash,
  BellRing, BellOff, Loader2
} from "lucide-react";
import {
  getAllNotifications,
  sendToAllStudents,
  sendToSpecificUsers,
  deleteNotification,
  searchStudentByCode,
} from "../../api/apiNotification.js";

/* ─── Quick-suggestion templates ─────────────────────────── */
const QUICK_TEMPLATES = [
  {
    id: 1,
    icon: "💰",
    label: "Nhắc đóng tiền phòng",
    type: "Tài chính",
    title: "Thông báo đóng tiền phòng tháng {month}",
    content:
      "Kính gửi các bạn sinh viên,\n\nBan quản lý ký túc xá thông báo: Hạn đóng tiền phòng tháng {month} là ngày {deadline}. Đề nghị các bạn thanh toán đúng hạn để tránh bị phạt trễ hạn.\n\nMọi thắc mắc vui lòng liên hệ văn phòng quản lý. Trân trọng!",
  },
  {
    id: 2,
    icon: "🧹",
    label: "Vệ sinh & kiểm tra phòng",
    type: "Nội quy",
    title: "Thông báo kiểm tra vệ sinh phòng ở",
    content:
      "Kính gửi các bạn sinh viên,\n\nBan quản lý sẽ tiến hành kiểm tra vệ sinh phòng ở vào ngày {date}. Đề nghị các bạn dọn dẹp phòng sạch sẽ, gọn gàng trước thời gian kiểm tra.\n\nPhòng không đạt yêu cầu sẽ bị nhắc nhở và xử lý theo quy định. Trân trọng!",
  },
  {
    id: 3,
    icon: "🔒",
    label: "Quy định giờ giấc ra vào",
    type: "Nội quy",
    title: "Nhắc nhở quy định giờ giấc ra vào ký túc xá",
    content:
      "Kính gửi các bạn sinh viên,\n\nBan quản lý nhắc nhở: Giờ đóng cửa ký túc xá là 23:00. Các bạn ra vào sau giờ quy định phải có lý do chính đáng và đăng ký trước với ban quản lý.\n\nMọi vi phạm sẽ bị xử lý theo nội quy ký túc xá. Đề nghị các bạn chấp hành nghiêm chỉnh!",
  },
  {
    id: 4,
    icon: "⚡",
    label: "Mất điện / bảo trì",
    type: "Thông báo hệ thống",
    title: "Thông báo cúp điện bảo trì",
    content:
      "Kính gửi các bạn sinh viên,\n\nDo công tác bảo trì hệ thống điện, ký túc xá sẽ cúp điện từ {startTime} đến {endTime} ngày {date}. Đề nghị các bạn chuẩn bị pin dự phòng, nến và các vật dụng cần thiết.\n\nXin lỗi vì sự bất tiện này. Ban quản lý trân trọng thông báo!",
  },
  {
    id: 5,
    icon: "🎉",
    label: "Sự kiện / hoạt động",
    type: "Hoạt động",
    title: "Thông báo hoạt động ngoại khóa sinh viên",
    content:
      "Kính gửi các bạn sinh viên,\n\nBan quản lý ký túc xá trân trọng thông báo về hoạt động {eventName} sẽ diễn ra vào lúc {time} ngày {date} tại {location}.\n\nRất mong được sự tham gia đông đảo của các bạn. Đây là cơ hội để giao lưu, gặp gỡ bạn bè. Trân trọng!",
  },
  {
    id: 6,
    icon: "📋",
    label: "Gia hạn hợp đồng",
    type: "Hợp đồng",
    title: "Thông báo gia hạn hợp đồng ở ký túc xá",
    content:
      "Kính gửi các bạn sinh viên,\n\nHợp đồng thuê phòng của bạn sẽ hết hạn vào ngày {deadline}. Đề nghị các bạn đến phòng quản lý để làm thủ tục gia hạn trước ngày {deadline - 7 ngày}.\n\nNếu không gia hạn, bạn sẽ phải dọn phòng theo quy định. Trân trọng!",
  },
];

const NOTIFICATION_TYPES = [
  "Thông báo chung",
  "Tài chính",
  "Nội quy",
  "Thông báo hệ thống",
  "Hoạt động",
  "Hợp đồng",
  "Khẩn cấp",
];

const TYPE_COLORS = {
  "Thông báo chung": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  "Tài chính": { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Nội quy": { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  "Thông báo hệ thống": { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  "Hoạt động": { bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500" },
  "Hợp đồng": { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
  "Khẩn cấp": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ─── Student search tag component ──────────────────────── */
const StudentTag = ({ student, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-sm font-medium">
    <User size={12} />
    {student.student_name || student.name || student.ho_ten || student.studentId}
    <button onClick={() => onRemove(student)} className="hover:text-red-500 ml-0.5 transition-colors">
      <X size={12} />
    </button>
  </span>
);

/* ─── Main component ─────────────────────────────────────── */
const NotificationManagement = () => {
  /* composer state */
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("Thông báo chung");
  const [target, setTarget] = useState("all"); // "all" | "specific"
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null); // { ok, message }

  /* student search */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  /* history */
  const [notifications, setNotifications] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyFilter, setHistoryFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  /* panel */
  const [expandComposer, setExpandComposer] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const templatesRef = useRef(null);

  /* Load history on mount */
  useEffect(() => {
    fetchHistory();
  }, []);

  /* Close templates dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (templatesRef.current && !templatesRef.current.contains(event.target)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getAllNotifications();
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  /* Student search with debounce */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchStudentByCode(searchQuery);
        setSearchResults(res.slice(0, 8));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [searchQuery]);

  const addStudent = (s) => {
    if (!selectedStudents.find((x) => x.id === s.id)) {
      setSelectedStudents((prev) => [...prev, s]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeStudent = (s) => {
    setSelectedStudents((prev) => prev.filter((x) => x.id !== s.id));
  };

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setContent(tpl.content);
    setType(tpl.type);
    setExpandComposer(true);
    setShowTemplates(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      setSendResult({ ok: false, message: "Vui lòng nhập tiêu đề và nội dung!" });
      return;
    }
    if (target === "specific" && selectedStudents.length === 0) {
      setSendResult({ ok: false, message: "Vui lòng chọn ít nhất 1 sinh viên!" });
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      if (target === "all") {
        await sendToAllStudents({ title, content, type });
      } else {
        const userIds = selectedStudents.map((s) => s.user_id || s.id);
        await sendToSpecificUsers({ title, content, type, userIds });
      }
      setSendResult({ ok: true, message: "Thông báo đã được gửi thành công!" });
      setTitle("");
      setContent("");
      setSelectedStudents([]);
      await fetchHistory();
    } catch (err) {
      setSendResult({ ok: false, message: err.message || "Gửi thất bại!" });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    setDeletingId(id);
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      /* silent */
    } finally {
      setDeletingId(null);
    }
  };

  const filteredNotifs = notifications.filter(
    (n) =>
      !historyFilter ||
      n.title?.toLowerCase().includes(historyFilter.toLowerCase()) ||
      n.type?.toLowerCase().includes(historyFilter.toLowerCase())
  );

  const typeColor = TYPE_COLORS[type] || TYPE_COLORS["Thông báo chung"];

  return (
    <div className="space-y-6">
      {/* ── Two-column layout ──────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* LEFT — Composer + Quick templates */}
        <div className="xl:col-span-3 space-y-5">
          {/* Composer card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-700">
              <div 
                className="flex items-center gap-3 text-white flex-1 cursor-pointer"
                onClick={() => setExpandComposer((v) => !v)}
              >
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Soạn thông báo mới</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Gửi đến toàn thể hoặc sinh viên cụ thể</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Templates dropdown button */}
                <div className="relative" ref={templatesRef}>
                  <button
                    onClick={() => setShowTemplates((v) => !v)}
                    className="p-2 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-all"
                    title="Gợi ý nhanh"
                  >
                    <Sparkles size={20} className="animate-pulse" />
                  </button>
                  
                  {/* Templates dropdown */}
                  {showTemplates && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-amber-500" />
                          <h4 className="font-bold text-slate-800 text-sm">Gợi ý nhanh</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Nhấn để áp dụng mẫu</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {QUICK_TEMPLATES.map((tpl) => {
                          const tc = TYPE_COLORS[tpl.type] || TYPE_COLORS["Thông báo chung"];
                          return (
                            <button
                              key={tpl.id}
                              onClick={() => applyTemplate(tpl)}
                              className="w-full text-left p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl shrink-0">{tpl.icon}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-slate-800 text-sm leading-snug">
                                    {tpl.label}
                                  </p>
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1.5 ${tc.bg} ${tc.text}`}
                                  >
                                    <span className={`w-1 h-1 rounded-full ${tc.dot}`} />
                                    {tpl.type}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setExpandComposer((v) => !v)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${expandComposer ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Form body */}
            {expandComposer && (
              <div className="p-6 space-y-5">
                {/* Result alert */}
                {sendResult && (
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${sendResult.ok
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                  >
                    {sendResult.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {sendResult.message}
                    <button className="ml-auto" onClick={() => setSendResult(null)}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Target toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Đối tượng nhận
                  </label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <TargetBtn
                      active={target === "all"}
                      icon={<Users size={15} />}
                      label="Tất cả sinh viên"
                      onClick={() => setTarget("all")}
                    />
                    <TargetBtn
                      active={target === "specific"}
                      icon={<User size={15} />}
                      label="Sinh viên cụ thể"
                      onClick={() => setTarget("specific")}
                    />
                  </div>
                </div>

                {/* Student search — only when specific */}
                {target === "specific" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Tìm sinh viên theo mã SV
                    </label>
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Nhập mã SV hoặc tên sinh viên..."
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm transition-all"
                      />
                      {searching && (
                        <Loader2
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
                        />
                      )}

                      {/* Dropdown results */}
                      {searchResults.length > 0 && (
                        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                          {searchResults.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => addStudent(s)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {(s.student_name || s.ho_ten || "S")[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {s.student_name || s.ho_ten || "—"}
                                </p>
                                <p className="text-xs text-slate-400">{s.student_id || s.ma_sv || s.id}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected tags */}
                    {selectedStudents.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedStudents.map((s) => (
                          <StudentTag key={s.id} student={s} onRemove={removeStudent} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Type select */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Loại thông báo
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm font-medium pr-10 transition-all"
                    >
                      {NOTIFICATION_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                  {/* type badge preview */}
                  <div className="mt-2 inline-flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${typeColor.bg} ${typeColor.text} rounded-full text-xs font-semibold`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
                      {type}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề ngắn gọn, rõ ràng..."
                    maxLength={200}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/200</p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Nội dung
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    placeholder="Soạn nội dung chi tiết tại đây..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm resize-none transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setTitle("");
                      setContent("");
                      setSelectedStudents([]);
                      setSendResult(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-medium transition-all"
                  >
                    <RotateCcw size={15} />
                    Xóa soạn thảo
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        {target === "all" ? "Phát hành đến tất cả" : `Gửi đến ${selectedStudents.length || "..."} SV`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Notification history */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            {/* History header */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-800">Lịch sử thông báo</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    {filteredNotifs.length}
                  </span>
                </div>
                <button
                  onClick={fetchHistory}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Làm mới"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
              {/* Search filter */}
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  placeholder="Tìm trong lịch sử..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* History list */}
            <div className="overflow-y-auto max-h-[600px]">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Loader2 size={32} className="animate-spin mb-3" />
                  <p className="text-sm">Đang tải lịch sử...</p>
                </div>
              ) : filteredNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <BellOff size={40} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">Chưa có thông báo nào</p>
                  <p className="text-xs mt-1 opacity-60">Soạn và gửi thông báo đầu tiên!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredNotifs.map((n) => {
                    const tc = TYPE_COLORS[n.type] || TYPE_COLORS["Thông báo chung"];
                    return (
                      <div
                        key={n.id}
                        className="group px-5 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${tc.bg} mt-0.5`}
                            >
                              <Bell size={14} className={tc.text} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                                {n.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${tc.bg} ${tc.text}`}
                                >
                                  <span className={`w-1 h-1 rounded-full ${tc.dot}`} />
                                  {n.type || "Chung"}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                  {n.target_audience === "SPECIFIC" ? (
                                    <>
                                      <User size={10} /> Cá nhân
                                    </>
                                  ) : (
                                    <>
                                      <Users size={10} /> Tất cả
                                    </>
                                  )}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                <Clock size={10} />
                                {fmtDate(n.created_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(n.id)}
                            disabled={deletingId === n.id}
                            className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa thông báo"
                          >
                            {deletingId === n.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ──────────────────────────────────────── */
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    violet: "from-violet-500 to-violet-600",
  };
  const lightColors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lightColors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
};

const TargetBtn = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-500 hover:text-slate-700"
      }`}
  >
    {icon}
    {label}
  </button>
);

export default NotificationManagement;

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Send, Search, Trash2, CheckCircle, Clock,
  AlertCircle, Loader2, Filter, RotateCcw, Eye, Reply,
  Star, User, Calendar, ChevronDown, X, MessageCircle
} from "lucide-react";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const replyModalRef = useRef(null);

  // Mock data - replace with API call
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      // Replace with actual API call
      const mockData = [
        {
          id: 1,
          studentName: "Nguyễn Văn A",
          studentId: "SV001",
          studentAvatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff",
          title: "Vấn đề về điều hòa phòng",
          content: "Điều hòa phòng 301 bị hỏng, không lạnh được. Mong ban quản lý sửa chữa sớm.",
          rating: 2,
          status: "pending",
          category: "Cơ sở vật chất",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          replies: []
        },
        {
          id: 2,
          studentName: "Trần Thị B",
          studentId: "SV002",
          studentAvatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=8b5cf6&color=fff",
          title: "Cảm ơn dịch vụ tốt",
          content: "Cảm ơn ban quản lý đã hỗ trợ tôi rất tốt. Dịch vụ ở ký túc xá rất chuyên nghiệp.",
          rating: 5,
          status: "resolved",
          category: "Dịch vụ",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          replies: [
            {
              id: 1,
              adminName: "Ban Quản Lý",
              content: "Cảm ơn bạn đã tin tưởng chúng tôi. Chúng tôi sẽ tiếp tục cải thiện dịch vụ.",
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
            }
          ]
        },
        {
          id: 3,
          studentName: "Lê Văn C",
          studentId: "SV003",
          studentAvatar: "https://ui-avatars.com/api/?name=Le+Van+C&background=ec4899&color=fff",
          title: "Đề xuất cải thiện khu vực sinh hoạt",
          content: "Tôi đề xuất nên có thêm bàn học ở khu vực sinh hoạt chung để sinh viên có thể học tập.",
          rating: 4,
          status: "in_progress",
          category: "Đề xuất",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          replies: []
        }
      ];
      setFeedbacks(mockData);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setSendingReply(true);
    try {
      // API call to send reply
      const newReply = {
        id: Date.now(),
        adminName: "Ban Quản Lý",
        content: replyText,
        createdAt: new Date()
      };

      setFeedbacks(feedbacks.map(f => 
        f.id === selectedFeedback.id 
          ? { ...f, replies: [...f.replies, newReply], status: "resolved" }
          : f
      ));

      setSelectedFeedback({
        ...selectedFeedback,
        replies: [...selectedFeedback.replies, newReply],
        status: "resolved"
      });

      setReplyText("");
      setTimeout(() => setShowReplyModal(false), 500);
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản ánh này?")) return;

    setDeletingId(id);
    try {
      // API call to delete
      setFeedbacks(feedbacks.filter(f => f.id !== id));
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
    } catch (err) {
      console.error("Error deleting feedback:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchSearch = !searchQuery || 
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    const matchRating = filterRating === "all" || f.rating === parseInt(filterRating);
    
    return matchSearch && matchStatus && matchRating;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", label: "Chờ xử lý" },
      in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Đang xử lý" },
      resolved: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Đã giải quyết" }
    };
    return colors[status] || colors.pending;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-emerald-500";
    if (rating >= 3) return "text-yellow-500";
    return "text-red-500";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageSquare size={20} />}
          label="Tổng phản ánh"
          value={feedbacks.length}
          color="blue"
        />
        <StatCard
          icon={<AlertCircle size={20} />}
          label="Chờ xử lý"
          value={feedbacks.filter(f => f.status === "pending").length}
          color="yellow"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Đang xử lý"
          value={feedbacks.filter(f => f.status === "in_progress").length}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          label="Đã giải quyết"
          value={feedbacks.filter(f => f.status === "resolved").length}
          color="emerald"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-800">Danh sách phản ánh</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    {filteredFeedbacks.length}
                  </span>
                </div>
                <button
                  onClick={fetchFeedbacks}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Làm mới"
                >
                  <RotateCcw size={15} />
                </button>
              </div>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên, mã SV hoặc tiêu đề..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="resolved">Đã giải quyết</option>
                  </select>

                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    <option value="all">Tất cả đánh giá</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                    <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                    <option value="3">⭐⭐⭐ (3 sao)</option>
                    <option value="2">⭐⭐ (2 sao)</option>
                    <option value="1">⭐ (1 sao)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feedback List */}
            <div className="overflow-y-auto max-h-[600px]">
              {loadingFeedbacks ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Loader2 size={32} className="animate-spin mb-3" />
                  <p className="text-sm">Đang tải phản ánh...</p>
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <MessageSquare size={40} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">Không có phản ánh nào</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredFeedbacks.map((feedback) => {
                    const statusColor = getStatusColor(feedback.status);
                    const isSelected = selectedFeedback?.id === feedback.id;

                    return (
                      <div
                        key={feedback.id}
                        onClick={() => setSelectedFeedback(feedback)}
                        className={`group p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={feedback.studentAvatar}
                            alt={feedback.studentName}
                            className="w-10 h-10 rounded-full shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {feedback.studentName}
                                </p>
                                <p className="text-xs text-slate-500">{feedback.studentId}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={`${
                                      i < feedback.rating
                                        ? `fill-yellow-400 ${getRatingColor(feedback.rating)}`
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-sm font-medium text-slate-800 line-clamp-1 mb-1">
                              {feedback.title}
                            </p>

                            <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                              {feedback.content}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor.bg} ${statusColor.text}`}
                              >
                                <span className={`w-1 h-1 rounded-full ${statusColor.dot}`} />
                                {statusColor.label}
                              </span>
                              <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">
                                {feedback.category}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                                <Calendar size={10} />
                                {formatDate(feedback.createdAt)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(feedback.id);
                            }}
                            disabled={deletingId === feedback.id}
                            className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            {deletingId === feedback.id ? (
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

        {/* Feedback Detail & Reply */}
        <div className="lg:col-span-1">
          {selectedFeedback ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
              {/* Detail Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Chi tiết phản ánh</h3>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Student Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <img
                    src={selectedFeedback.studentAvatar}
                    alt={selectedFeedback.studentName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {selectedFeedback.studentName}
                    </p>
                    <p className="text-xs text-slate-500">{selectedFeedback.studentId}</p>
                  </div>
                </div>

                {/* Feedback Info */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Tiêu đề
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{selectedFeedback.title}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Nội dung
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedFeedback.content}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Đánh giá
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < selectedFeedback.rating
                              ? `fill-yellow-400 ${getRatingColor(selectedFeedback.rating)}`
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Danh mục
                    </p>
                    <p className="text-sm text-slate-700">{selectedFeedback.category}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Trạng thái
                  </p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(selectedFeedback.status).bg} ${getStatusColor(selectedFeedback.status).text}`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedFeedback.status).dot}`} />
                    {getStatusColor(selectedFeedback.status).label}
                  </div>
                </div>

                {/* Replies */}
                {selectedFeedback.replies.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Trả lời ({selectedFeedback.replies.length})
                    </p>
                    <div className="space-y-3">
                      {selectedFeedback.replies.map((reply) => (
                        <div key={reply.id} className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-slate-800 mb-1">
                            {reply.adminName}
                          </p>
                          <p className="text-xs text-slate-700 leading-relaxed mb-1">
                            {reply.content}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatDate(reply.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Button */}
              <div className="px-6 py-4 border-t border-slate-100">
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <Reply size={16} />
                  Trả lời
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center h-96 text-slate-400">
              <MessageCircle size={48} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Chọn phản ánh để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={replyModalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <h3 className="font-bold">Trả lời phản ánh</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Phản ánh từ
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedFeedback.studentName}
                </p>
                <p className="text-xs text-slate-600 mt-1">"{selectedFeedback.title}"</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Nội dung trả lời
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                  placeholder="Nhập nội dung trả lời..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none text-sm resize-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingReply ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Gửi trả lời
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Sub-components */
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    yellow: "from-yellow-500 to-yellow-600",
    emerald: "from-emerald-500 to-emerald-600",
  };
  const lightColors = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    emerald: "bg-emerald-50 text-emerald-600",
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

export default FeedbackManagement;

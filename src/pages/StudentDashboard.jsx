import React, { useState } from "react";
import { MOCK_BILLS, MOCK_NOTIFICATIONS, MOCK_FEEDBACKS } from "../utils/constants.jsx";
import { BillStatus } from "../utils/types.js";
import { CreditCard, FileText, Bell, Send, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { analyzeSentiment } from "../services/geminiService.js";

const StudentDashboard = ({ user, tab }) => {
  const [bills, setBills] = useState(MOCK_BILLS);
  const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACKS);
  const [newFeedback, setNewFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;

    setIsSubmitting(true);
    const sentiment = await analyzeSentiment(newFeedback);

    const feedback = {
      id: `f-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      content: newFeedback,
      sentiment,
      status: "New",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setFeedbacks([feedback, ...feedbacks]);
    setNewFeedback("");
    setIsSubmitting(false);
    alert("Đã gửi phản ánh thành công! Hệ thống AI đã phân tích cảm xúc phản ánh của bạn.");
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return <TrendingUp className="text-emerald-500" size={16} />;
      case "Negative":
        return <TrendingDown className="text-rose-500" size={16} />;
      default:
        return <Minus className="text-slate-400" size={16} />;
    }
  };

  if (tab === "profile") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative">
            <img src={user.avatar} alt="Avatar" className="w-32 h-32 rounded-3xl border-4 border-slate-50 shadow-sm" />
            <div className="absolute bottom-1 right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
              <p className="text-slate-500 font-medium tracking-tight">Mã sinh viên: {user.studentId}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Email</p>
                <p className="font-semibold text-slate-800">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Giới tính</p>
                <p className="font-semibold text-slate-800">{user.gender}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Số điện thoại</p>
                <p className="font-semibold text-slate-800">0987-XXX-XXX</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Cơ sở đào tạo</p>
                <p className="font-semibold text-slate-800">Trường CNTT & Truyền thông</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "contract") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-bold flex items-center text-slate-900">
              <FileText className="mr-2 text-blue-600" /> Hợp đồng nội trú KTX
            </h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-tight">Đang hiệu lực</span>
          </div>
          <div className="space-y-4 divide-y divide-slate-50">
            <div className="py-4 grid grid-cols-2">
              <span className="text-slate-500 font-medium">Mã hợp đồng</span>
              <span className="font-bold text-slate-900 text-right md:text-left">HD-2024-8821</span>
            </div>
            <div className="py-4 grid grid-cols-2">
              <span className="text-slate-500 font-medium">Phòng lưu trú</span>
              <span className="font-bold text-blue-700 text-right md:text-left">P.201 - Tòa B1 (Nữ)</span>
            </div>
            <div className="py-4 grid grid-cols-2">
              <span className="text-slate-500 font-medium">Ngày bắt đầu</span>
              <span className="font-bold text-slate-800 text-right md:text-left">01/09/2023</span>
            </div>
            <div className="py-4 grid grid-cols-2">
              <span className="text-slate-500 font-medium">Ngày kết thúc</span>
              <span className="font-bold text-slate-800 text-right md:text-left">30/06/2024</span>
            </div>
            <div className="py-4 grid grid-cols-2">
              <span className="text-slate-500 font-medium">Phí nội trú / tháng</span>
              <span className="font-bold text-blue-700 text-lg text-right md:text-left">500,000 VNĐ</span>
            </div>
          </div>
          <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-200">Tải file hợp đồng (PDF)</button>
        </div>
      </div>
    );
  }

  if (tab === "bills") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl mr-4">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">Cần thanh toán</p>
              <p className="text-2xl font-bold text-slate-900">700,000đ</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">Đã quyết toán</p>
              <p className="text-2xl font-bold text-slate-900">1,450,000đ</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">Dự kiến kỳ sau</p>
              <p className="text-2xl font-bold text-slate-900">680,000đ</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Kỳ hóa đơn</th>
                  <th className="px-6 py-4">Tiền phòng</th>
                  <th className="px-6 py-4">Điện & Nước</th>
                  <th className="px-6 py-4">Tổng cộng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{bill.month}</td>
                    <td className="px-6 py-4 text-slate-600">{bill.roomFee.toLocaleString()}đ</td>
                    <td className="px-6 py-4 text-slate-600">{(bill.electricity + bill.water).toLocaleString()}đ</td>
                    <td className="px-6 py-4 font-bold text-blue-700">{bill.total.toLocaleString()}đ</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          bill.status === BillStatus.PAID ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {bill.status === BillStatus.UNPAID && (
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-md shadow-slate-200 transition-all active:scale-95">
                          Cổng VNPay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "notifications") {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div key={notif.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-slate-900 flex gap-4 transition-all hover:shadow-md">
            <div className="shrink-0 p-3 bg-slate-50 text-slate-900 rounded-2xl h-fit">
              <Bell size={24} />
            </div>
            <div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-lg text-slate-900">{notif.title}</h4>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{notif.date}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{notif.content}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "feedback") {
    return (
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex items-center text-slate-900">
              <AlertCircle className="mr-2 text-blue-600" /> Gửi phản ánh mới
            </h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <textarea
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none h-40 resize-none text-sm transition-all"
                placeholder="Gửi yêu cầu sửa chữa hoặc đóng góp ý kiến..."
              />
              <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-2">
                <div className="p-1 bg-blue-100 rounded text-blue-600 shrink-0">
                  <AlertCircle size={12} />
                </div>
                <p className="text-[11px] text-blue-700 leading-tight">AI sẽ phân tích nội dung để ưu tiên các phản ánh tiêu cực/khẩn cấp.</p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newFeedback.trim()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                {isSubmitting ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <Send size={18} className="mr-2" /> Gửi phản ánh
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 px-2">Lịch sử phản ánh</h3>
          {feedbacks.map((f) => (
            <div key={f.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all hover:border-blue-100">
              <div className="flex justify-between mb-2 items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${f.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {f.status === "Resolved" ? "Đã hoàn thành" : "Đang xử lý"}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] text-slate-500 font-bold uppercase">
                    {getSentimentIcon(f.sentiment)}
                    {f.sentiment}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{f.createdAt}</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{f.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div>Chọn tính năng bên trái</div>;
};

export default StudentDashboard;

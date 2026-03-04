import React, { useState } from "react";
import { Send, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

const StudentFeedback = ({ user }) => {
  const [feedbacks, setFeedbacks] = useState([]);
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
};

// Placeholder function
const analyzeSentiment = async (text) => {
  return "Neutral";
};

export default StudentFeedback;

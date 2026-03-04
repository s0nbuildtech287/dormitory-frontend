import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const FeedbackList = ({ feedbacks, setFeedbacks }) => {
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

  const handleStatusToggle = (id) => {
    setFeedbacks((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextStatus = f.status === "New" ? "Processing" : f.status === "Processing" ? "Resolved" : "New";
          return { ...f, status: nextStatus };
        }
        return f;
      }),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {feedbacks.map((f) => (
        <div key={f.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-100 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-md">{f.studentName.charAt(0)}</div>
              <div>
                <h4 className="font-bold text-slate-900">{f.studentName}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{f.createdAt}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-[10px] text-slate-600 border border-slate-100 font-bold uppercase">
                {getSentimentIcon(f.sentiment)}
                {f.sentiment}
              </div>
              <button
                onClick={() => handleStatusToggle(f.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all tracking-tight ${
                  f.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : f.status === "Processing" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {f.status === "Resolved" ? "Đã xử lý" : f.status === "Processing" ? "Đang thực hiện" : "Mới tiếp nhận"}
              </button>
            </div>
          </div>
          <div className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-2xl italic border border-slate-100">"{f.content}"</div>
          {f.status !== "Resolved" && (
            <div className="mt-4 flex justify-end">
              <button onClick={() => handleStatusToggle(f.id)} className="text-blue-700 text-[11px] font-bold hover:underline transition-all uppercase tracking-widest">
                Tiến trình kế tiếp →
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedbackList;

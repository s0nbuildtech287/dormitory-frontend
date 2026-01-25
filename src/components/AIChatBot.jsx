import React from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { getAIChatResponse } from "../services/geminiService.js";

const AIChatBot = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([{ role: "bot", text: "Chào bạn! Mình là trợ lý ảo KTX. Mình có thể giúp gì cho bạn?" }]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    const botResponse = await getAIChatResponse([], userText);
    setMessages((prev) => [...prev, { role: "bot", text: botResponse || "Hệ thống đang bận..." }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-blue-400" />
              <span className="font-bold tracking-tight">Trợ lý ảo AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user" ? "bg-blue-700 text-white rounded-br-none" : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl text-xs text-slate-500 shadow-sm animate-pulse">Đang phản hồi...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button onClick={handleSend} disabled={isLoading} className="bg-slate-900 text-white p-2.5 rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95">
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 hover:scale-105 transition-all duration-300 flex items-center justify-center border-4 border-white/10"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default AIChatBot;

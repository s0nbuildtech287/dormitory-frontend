import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, RotateCcw, ChevronDown, Check, Zap, Brain, Sparkles } from "lucide-react";
import { useChatBot } from "../contexts/ChatBotContext.jsx";
import { API_BASE_URL } from "../config/api.js";



const MODELS = [
  { id: "gpt-4o",      label: "GPT-4o",      badge: "Smart",  badgeColor: "bg-violet-500", icon: Brain },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", badge: "Fast",   badgeColor: "bg-blue-500",   icon: Zap },
  { id: "gemini-pro",  label: "Gemini Pro",  badge: "Google", badgeColor: "bg-emerald-500", icon: Sparkles },
];

const makeWelcome = () => ({
  id: Date.now(),
  role: "bot",
  text: "Chào bạn! Mình là trợ lý ảo KTX 👋\nMình có thể giúp bạn tra cứu phòng, quy trình đăng ký, hoặc bất kỳ thắc mắc nào về ký túc xá.",
  time: new Date(),
});

async function getAIChatResponse(history, userText, model = "gpt-4o") {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, history, model }),
    });
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    return data.reply || "Hệ thống đang bận, vui lòng thử lại.";
  } catch {
    return "Hệ thống đang bận, vui lòng thử lại sau.";
  }
}

// ─── ModelSelector ────────────────────────────────────────────────────────────
const ModelSelector = ({ model, models, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = models.find((m) => m.id === model) || models[0];
  const Icon = current?.icon || Bot;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          open ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        <Icon size={13} />
        <span>{current?.label}</span>
        {current?.badge && (
          <span className={`${current.badgeColor} text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold`}>{current.badge}</span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full mb-1.5 left-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-10 min-w-[190px]">
          {models.map((m) => {
            const MIcon = m.icon || Bot;
            const isActive = m.id === model;
            return (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
                  isActive ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <MIcon size={14} className={isActive ? "text-white" : "text-slate-500"} />
                <span className="flex-1 text-left font-medium">{m.label}</span>
                {m.badge && (
                  <span className={`${m.badgeColor} text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold`}>{m.badge}</span>
                )}
                {isActive && <Check size={12} className="text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── TypingIndicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-3">
    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
      <Bot size={14} className="text-white" />
    </div>
    <div className="bg-white border border-slate-100 px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  </div>
);

// ─── MessageBubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isBot = msg.role === "bot";
  return (
    <div className={`flex items-end gap-2 mb-3 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div className="max-w-[72%]">
        <div className={`px-3 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
          isBot
            ? "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-bl-sm"
            : "bg-slate-800 text-white rounded-2xl rounded-br-sm"
        }`}>
          {msg.text.replace(/\*\*(.*?)\*\*/g, "$1")}
        </div>
        <p className={`text-[10px] mt-0.5 opacity-40 px-1 ${isBot ? "text-left" : "text-right"}`}>
          {msg.time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-700">U</div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AIChatBot = () => {
  const { isOpen, openChat, closeChat, pendingPrompt, clearPendingPrompt, initialMessages, clearInitialMessages } = useChatBot();
  const [messages, setMessages] = useState([makeWelcome()]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gpt-4o");
  const [availableModels, setAvailableModels] = useState(MODELS);
  const bottomRef = useRef(null);

  // Load models từ backend khi mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/ai/models`)
      .then((r) => r.json())
      .then((data) => {
        console.log("[AIChatBot] models từ backend:", data);
        if (data.models?.length) {
          const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500"];
          const iconList = [Brain, Zap, Sparkles, Zap, Brain];
          const mapped = data.models.map((m, i) => ({
            ...m,
            badgeColor: colors[i % colors.length],
            icon: iconList[i % iconList.length],
          }));
          console.log("[AIChatBot] mapped models:", mapped.map((m) => m.id));
          setAvailableModels(mapped);
          setModel(data.defaultModel || mapped[0].id);
        }
      })
      .catch((err) => console.error("[AIChatBot] load models lỗi:", err));
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, isLoading, isOpen]);

  // Khi chatbot mở với pendingPrompt → điền sẵn vào input, không tự gửi
  useEffect(() => {
    if (isOpen && pendingPrompt) {
      setInput(pendingPrompt);
      clearPendingPrompt();
    }
  }, [isOpen, pendingPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Khi chatbot mở với initialMessages → load tin nhắn sẵn (bot đã trả lời rồi)
  useEffect(() => {
    if (isOpen && initialMessages) {
      setMessages([makeWelcome(), ...initialMessages]);
      clearInitialMessages();
    }
  }, [isOpen, initialMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    setMessages([makeWelcome()]);
    setInput("");
    setIsLoading(false);
  };

  const handleSend = async (quickText) => {
    const text = (quickText || input).trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), role: "user", text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const history = messages
      .slice(-20)
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));

    const reply = await getAIChatResponse(history, text, model);
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply, time: new Date() }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => openChat()}
        title="Chat với AI"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-slate-800 text-white shadow-2xl hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-4 border-white/10"
      >
        <span className="absolute inset-0 rounded-full border-2 border-slate-700 animate-ping opacity-40" />
        <MessageCircle size={26} />
      </button>

      {/* Backdrop + Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeChat()}
        >
          <div className="bg-white w-full max-w-4xl h-[90vh] max-h-[820px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">Trợ lý ảo KTX</span>
                    <span className="bg-green-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">Online</span>
                  </div>
                  <p className="text-white/55 text-xs">Hỗ trợ thông tin ký túc xá 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleReset} title="Cuộc trò chuyện mới" className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 transition-colors">
                  <RotateCcw size={16} />
                </button>
                <button onClick={closeChat} title="Đóng" className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="px-5 pt-3 pb-4 bg-white border-t border-slate-100 flex-shrink-0">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Nhập câu hỏi của bạn... (Enter gửi, Shift+Enter xuống dòng)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-all"
              />
              <div className="flex items-center justify-between mt-2">
                <ModelSelector model={model} models={availableModels} onChange={setModel} />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1.5 text-sm font-medium"
                >
                  <Send size={15} />
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatBot;

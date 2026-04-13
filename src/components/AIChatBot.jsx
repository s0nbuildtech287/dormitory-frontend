import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, RotateCcw, History, Plus, Trash2, Edit2, Check, ChevronDown, Zap, Brain, Sparkles } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Phòng còn trống không?",
  "Quy trình đăng ký KTX?",
  "Mức phí phòng hiện tại?",
  "Cách gia hạn hợp đồng?",
];

const MODELS = [
  { id: "gpt-4o",       label: "GPT-4o",       badge: "Smart",  badgeColor: "bg-violet-500", icon: Brain },
  { id: "gpt-4o-mini",  label: "GPT-4o Mini",  badge: "Fast",   badgeColor: "bg-blue-500",   icon: Zap },
  { id: "gemini-pro",   label: "Gemini Pro",   badge: "Google", badgeColor: "bg-emerald-500", icon: Sparkles },
];

// ─── ModelSelector ────────────────────────────────────────────────────────────
const ModelSelector = ({ model, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = MODELS.find((m) => m.id === model) || MODELS[0];
  const Icon = current.icon;

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
          open
            ? "border-slate-700 bg-slate-800 text-white"
            : "border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        <Icon size={13} />
        <span>{current.label}</span>
        <span className={`${current.badgeColor} text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold`}>
          {current.badge}
        </span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-1.5 left-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-10 min-w-[190px]">
          {MODELS.map((m) => {
            const MIcon = m.icon;
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
                <span className={`${m.badgeColor} text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold`}>
                  {m.badge}
                </span>
                {isActive && <Check size={12} className="text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const makeWelcome = () => ({
  id: Date.now(),
  role: "bot",
  text: "Chào bạn! Mình là trợ lý ảo KTX 👋\nMình có thể giúp bạn tra cứu phòng, quy trình đăng ký, hoặc bất kỳ thắc mắc nào về ký túc xá.",
  time: new Date(),
});

const makeSession = (title) => ({
  id: Date.now(),
  title: title || "Cuộc trò chuyện mới",
  time: new Date(),
  messages: [makeWelcome()],
});

// ─── API helper ───────────────────────────────────────────────────────────────
async function getAIChatResponse(history, userText, model = "gpt-4o") {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, history, model }),
    });
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    return data.reply || data.message || "Hệ thống đang bận, vui lòng thử lại.";
  } catch {
    return "Hệ thống đang bận, vui lòng thử lại sau.";
  }
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-3">
    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
      <Bot size={14} className="text-white" />
    </div>
    <div className="bg-white border border-slate-100 px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
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
        <div
          className={`px-3 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
            isBot
              ? "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-bl-sm"
              : "bg-slate-800 text-white rounded-2xl rounded-br-sm"
          }`}
        >
          {msg.text}
        </div>
        <p className={`text-[10px] mt-0.5 opacity-40 px-1 ${isBot ? "text-left" : "text-right"}`}>
          {msg.time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-700">
          U
        </div>
      )}
    </div>
  );
};

// ─── ChatSidebar ──────────────────────────────────────────────────────────────
const ChatSidebar = ({ open, sessions, activeId, onSelect, onNew, onDelete, onRename }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (e, s) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditValue(s.title);
  };

  const commitEdit = (id) => {
    if (editValue.trim()) onRename(id, editValue.trim());
    setEditingId(null);
  };

  return (
    <div
      className="flex-shrink-0 bg-slate-800 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
      style={{ width: open ? 240 : 0, borderRight: open ? "1px solid rgba(255,255,255,0.08)" : "none" }}
    >
      <div className="w-60 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-3 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <History size={13} className="text-white/70" />
            <span className="text-white/85 font-bold text-xs tracking-wide">Lịch sử</span>
            <span className="bg-white/10 text-white/60 text-[10px] px-1.5 py-0.5 rounded-full">{sessions.length}</span>
          </div>
          <button
            onClick={onNew}
            className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Cuộc trò chuyện mới"
          >
            <Plus size={12} className="text-white/70" />
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto py-1 px-1 scrollbar-thin scrollbar-thumb-white/15">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`group mb-0.5 rounded-xl border transition-all cursor-pointer ${
                s.id === activeId
                  ? "bg-white/13 border-white/15"
                  : "bg-transparent border-transparent hover:bg-white/7"
              }`}
            >
              <div className="flex items-center px-2 py-2 gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={11} className="text-white/60" />
                </div>
                <div className="flex-1 min-w-0" onClick={() => onSelect(s.id)}>
                  {editingId === s.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(s.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-white text-xs font-semibold w-full border-b border-white/40 outline-none"
                    />
                  ) : (
                    <>
                      <p className={`text-xs truncate ${s.id === activeId ? "text-white font-semibold" : "text-white/80"}`}>
                        {s.title}
                      </p>
                      <p className="text-[10px] text-white/35 truncate mt-0.5">
                        {s.time.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} · {s.messages.length} tin
                      </p>
                    </>
                  )}
                </div>
                {editingId !== s.id && (
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => startEdit(e, s)}
                      className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 size={11} />
                    </button>
                    {sessions.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                        className="p-0.5 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-2 py-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-1.5 text-white/60 border border-white/15 hover:border-white/40 hover:bg-white/7 rounded-xl py-1.5 text-xs transition-all"
          >
            <Plus size={11} /> Cuộc trò chuyện mới
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AIChatBot = () => {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState(() => [makeSession("Cuộc trò chuyện 1")]);
  const [activeId, setActiveId] = useState(() => sessions[0]?.id);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gpt-4o");
  const bottomRef = useRef(null);

  const activeSession = sessions.find((s) => s.id === activeId);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, isLoading, open, activeId]);

  // ── session helpers ──
  const updateSession = (id, updater) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updater(s) } : s)));

  const handleNewSession = () => {
    const s = makeSession(`Cuộc trò chuyện ${sessions.length + 1}`);
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    setInput("");
    setIsLoading(false);
  };

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (id === activeId && next.length) setActiveId(next[0].id);
      return next;
    });
  };

  const handleRenameSession = (id, newTitle) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));

  const handleReset = () => {
    updateSession(activeId, () => ({
      messages: [makeWelcome()],
      title: "Cuộc trò chuyện mới",
    }));
    setInput("");
    setIsLoading(false);
  };

  const handleSend = async (quickText) => {
    const text = (quickText || input).trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), role: "user", text, time: new Date() };
    updateSession(activeId, (s) => ({
      messages: [...s.messages, userMsg],
      title: s.messages.length === 1 ? text.slice(0, 30) : s.title,
    }));
    setInput("");
    setIsLoading(true);

    const history = (activeSession?.messages || [])
      .slice(-20)
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));

    const reply = await getAIChatResponse(history, text, model);
    const botMsg = { id: Date.now() + 1, role: "bot", text: reply, time: new Date() };
    updateSession(activeId, (s) => ({ messages: [...s.messages, botMsg] }));
    setIsLoading(false);
  };

  return (
    <>
      {/* ── Floating Bubble ── */}
      <button
        onClick={() => setOpen(true)}
        title="Chat với AI"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-slate-800 text-white shadow-2xl hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-4 border-white/10"
      >
        <span className="absolute inset-0 rounded-full border-2 border-slate-700 animate-ping opacity-40" />
        <MessageCircle size={26} />
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {/* ── Modal ── */}
          <div className="bg-white w-full max-w-4xl h-[85vh] max-h-[700px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

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
                <button
                  onClick={() => setHistoryOpen((v) => !v)}
                  title="Lịch sử trò chuyện"
                  className={`p-1.5 rounded-lg transition-colors ${historyOpen ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"}`}
                >
                  <History size={16} />
                </button>
                <button
                  onClick={handleReset}
                  title="Làm mới"
                  className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Đóng"
                  className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">

              {/* Sidebar */}
              <ChatSidebar
                open={historyOpen}
                sessions={sessions}
                activeId={activeId}
                onSelect={(id) => { setActiveId(id); setInput(""); setIsLoading(false); }}
                onNew={handleNewSession}
                onDelete={handleDeleteSession}
                onRename={handleRenameSession}
              />

              {/* Chat panel */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-slate-200">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={bottomRef} />
                </div>

                {/* Quick replies */}
                <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-xs border border-slate-300 text-slate-600 hover:border-slate-700 hover:text-slate-800 hover:bg-slate-50 px-2.5 py-1 rounded-full transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input area */}
                <div className="px-5 pt-3 pb-4 bg-white border-t border-slate-100 flex-shrink-0">
                  <textarea
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Nhập câu hỏi của bạn... (Enter gửi, Shift+Enter xuống dòng)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-all"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <ModelSelector model={model} onChange={setModel} />
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
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatBot;

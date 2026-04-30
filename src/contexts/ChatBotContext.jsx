import { createContext, useContext, useState } from "react";

const ChatBotContext = createContext(null);

export const ChatBotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  // pendingPrompt: điền sẵn vào input để user chỉnh rồi gửi
  const [pendingPrompt, setPendingPrompt] = useState(null);
  // initialMessages: mở chatbot với lịch sử tin nhắn sẵn (bot đã trả lời rồi)
  const [initialMessages, setInitialMessages] = useState(null);

  /**
   * Mở chatbot với prompt điền sẵn vào input
   */
  const openChat = (prompt = null) => {
    setPendingPrompt(prompt);
    setInitialMessages(null);
    setIsOpen(true);
  };

  /**
   * Mở chatbot với kết quả bot sẵn — user chỉ cần hỏi thêm
   * @param {Array} messages - [{ role: "user"|"bot", text, time }]
   */
  const openChatWithMessages = (messages) => {
    setInitialMessages(messages);
    setPendingPrompt(null);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setPendingPrompt(null);
    setInitialMessages(null);
  };

  const clearPendingPrompt = () => setPendingPrompt(null);
  const clearInitialMessages = () => setInitialMessages(null);

  return (
    <ChatBotContext.Provider value={{
      isOpen, openChat, openChatWithMessages, closeChat,
      pendingPrompt, clearPendingPrompt,
      initialMessages, clearInitialMessages,
    }}>
      {children}
    </ChatBotContext.Provider>
  );
};

export const useChatBot = () => {
  const ctx = useContext(ChatBotContext);
  if (!ctx) throw new Error("useChatBot must be used within ChatBotProvider");
  return ctx;
};

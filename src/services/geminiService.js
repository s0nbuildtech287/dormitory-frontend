import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly when initializing the GoogleGenAI client instance.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSentiment = async (text) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Phân tích cảm xúc của đoạn văn bản sau đây (trả về duy nhất một trong ba từ: Positive, Negative, Neutral): "${text}"`,
    });
    // The GenerateContentResponse object features a text property (not a method).
    const result = response.text?.trim();
    if (result?.includes("Positive")) return "Positive";
    if (result?.includes("Negative")) return "Negative";
    return "Neutral";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Neutral";
  }
};

export const getAIChatResponse = async (history, message) => {
  const ai = getAI();
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction:
          "Bạn là một trợ lý ảo hỗ trợ sinh viên tại Ký túc xá Đại học. Hãy trả lời thân thiện, ngắn gọn và hữu ích về các vấn đề như: nội quy, cách thanh toán hóa đơn, báo hỏng thiết bị, và thời gian mở cửa.",
      },
    });

    // chat.sendMessage returns a GenerateContentResponse object.
    const response = await chat.sendMessage({ message });
    // Directly access the .text property of GenerateContentResponse.
    return response.text;
  } catch (error) {
    console.error("Chatbot Error:", error);
    return "Xin lỗi, hiện tại hệ thống AI đang bận. Vui lòng thử lại sau.";
  }
};

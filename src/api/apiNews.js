const API_URL = "http://localhost:1234/api/news";

/**
 * Lấy danh sách tin tức từ TLU
 * @param {Object} params - { category, tag, page, limit }
 */
export const fetchNews = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}${query ? "?" + query : ""}`);
  if (!response.ok) throw new Error("Lỗi tải tin tức");
  return response.json();
};

/**
 * Làm mới cache tin tức
 */
export const refreshNews = async () => {
  const response = await fetch(`${API_URL}/refresh`, { method: "POST" });
  if (!response.ok) throw new Error("Lỗi làm mới tin tức");
  return response.json();
};


/**
 * Cào nội dung bài viết TLU rồi AI phân tích luôn — trả về kết quả sẵn
 * @param {string} url - URL bài viết tlu.edu.vn
 * @param {string} title - Tiêu đề bài viết
 */
export const analyzeArticle = async (url, title) => {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title }),
  });
  if (!response.ok) throw new Error("Lỗi phân tích bài viết");
  return response.json();
};

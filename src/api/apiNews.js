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


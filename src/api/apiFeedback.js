/**
 * Feedback Management API Functions
 */

import { API_BASE_URL } from "../config/api.js";

const getAuthToken = () => localStorage.getItem('token');

const authHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Get AI statistics: sentiment distribution, top emotions, high priority unresolved
 * @returns {Promise<{ sentimentDistribution, topEmotions, highPriorityUnresolved }>}
 */
export const getAIStatistics = async () => {
  const response = await fetch(`${API_BASE_URL}/feedbacks/ai-statistics`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi khi tải thống kê AI');
  return data.data;
};

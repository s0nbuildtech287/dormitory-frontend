/**
 * Pricing Settings API Functions (Invoice-related)
 */

const API_BASE_URL = "http://localhost:1234/api";

const getAuthToken = () => localStorage.getItem("token");

const authHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi server");
  return data;
};

/**
 * Get pricing settings
 */
export const getPricingSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/invoices/pricing-settings`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Update pricing settings
 * @param {Object} pricingData - Pricing configuration object
 */
export const updatePricingSettings = async (pricingData) => {
  const response = await fetch(`${API_BASE_URL}/invoices/pricing-settings`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ value: pricingData }),
  });
  return handleResponse(response);
};

/**
 * Invoice Management API Functions
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
 * Get all invoices (optionally filter by status, month, search)
 * @param {Object} filters - { status, month, search, limit }
 */
export const getInvoices = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.month) params.append("month", filters.month);
  if (filters.search) params.append("search", filters.search);
  if (filters.limit) params.append("limit", filters.limit);

  const response = await fetch(`${API_BASE_URL}/invoices?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get invoice by ID (full details)
 */
export const getInvoiceById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Create new invoice
 */
export const createInvoice = async (invoiceData) => {
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(invoiceData),
  });
  return handleResponse(response);
};

/**
 * Create invoice from room meter readings
 * @param {string} roomId
 * @param {string} billingMonth - YYYY-MM-DD format
 * @param {Object} meterReadings - { electric_end, water_end }
 */
export const createInvoiceFromRoom = async (roomId, billingMonth, meterReadings) => {
  const response = await fetch(`${API_BASE_URL}/invoices/from-room`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ roomId, billingMonth, meterReadings }),
  });
  return handleResponse(response);
};

/**
 * Update invoice
 */
export const updateInvoice = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

/**
 * Mark invoice as paid
 * @param {string} id - Invoice ID
 * @param {string} paymentMethod - Payment method (Tiền mặt, Chuyển khoản, Ví điện tử)
 */
export const markInvoiceAsPaid = async (id, paymentMethod = "Tiền mặt") => {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}/mark-paid`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ paymentMethod }),
  });
  return handleResponse(response);
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (id) => {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get revenue statistics
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
export const getRevenueStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(`${API_BASE_URL}/invoices/statistics/revenue?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get invoices by user (for student view)
 */
export const getInvoicesByUser = async (userId = null) => {
  const url = userId 
    ? `${API_BASE_URL}/invoices/user/${userId}`
    : `${API_BASE_URL}/invoices/user`;
  
  const response = await fetch(url, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Update overdue invoices (admin only)
 */
export const updateOverdueInvoices = async () => {
  const response = await fetch(`${API_BASE_URL}/invoices/update-overdue`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

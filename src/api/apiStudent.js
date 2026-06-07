/**
 * apiStudent.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Tất cả các API call dành cho phía sinh viên.
 * Base URL: /api/student
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API_BASE_URL } from "../config/api.js";

const API_BASE = `${API_BASE_URL}/student`;

/** Lấy token từ localStorage */
const token = () => localStorage.getItem('token');

/** Headers chuẩn có Authorization */
const headers = () => ({
    'Content-Type': 'application/json',
    ...(token() && { Authorization: `Bearer ${token()}` }),
});

/** Xử lý response chung */
const handle = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi server');
    return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy hồ sơ cá nhân đầy đủ của sinh viên đang đăng nhập.
 * Bao gồm: register_form + thông tin phòng + hợp đồng.
 * @returns {Promise<Object>} { success, data }
 */
export const getStudentProfile = () =>
    fetch(`${API_BASE}/profile`, { headers: headers() }).then(handle);

// ─────────────────────────────────────────────────────────────────────────────
// HỢP ĐỒNG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách hợp đồng của sinh viên đang đăng nhập.
 * @returns {Promise<Object>} { success, data: [] }
 */
export const getStudentContracts = () =>
    fetch(`${API_BASE}/contracts`, { headers: headers() }).then(handle);

// ─────────────────────────────────────────────────────────────────────────────
// HÓA ĐƠN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách hóa đơn của phòng sinh viên đang ở.
 * @returns {Promise<Object>} { success, data: [] }
 */
export const getStudentInvoices = () =>
    fetch(`${API_BASE}/invoices`, { headers: headers() }).then(handle);

// ─────────────────────────────────────────────────────────────────────────────
// THÔNG BÁO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy thông báo dành cho sinh viên (ALL + STUDENTS + SPECIFIC).
 * @returns {Promise<Object>} { success, data: [] }
 */
export const getStudentNotifications = () =>
    fetch(`${API_BASE}/notifications`, { headers: headers() }).then(handle);

// ─────────────────────────────────────────────────────────────────────────────
// PHẢN HỒI (FEEDBACK)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách phản hồi sinh viên đã gửi.
 * @returns {Promise<Object>} { success, data: [] }
 */
export const getStudentFeedbacks = () =>
    fetch(`${API_BASE}/feedbacks`, { headers: headers() }).then(handle);

/**
 * Gửi phản hồi mới.
 * @param {{ category: string, content: string, room_id?: string, images?: any }} data
 * @returns {Promise<Object>} { success, data: feedback }
 */
export const createStudentFeedback = (data) =>
    fetch(`${API_BASE}/feedbacks`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data),
    }).then(handle);

/**
 * Xóa phản hồi của sinh viên.
 * @param {string} id - feedback ID
 * @returns {Promise<Object>} { success }
 */
export const deleteStudentFeedback = (id) =>
    fetch(`${API_BASE}/feedbacks/${id}`, {
        method: 'DELETE',
        headers: headers(),
    }).then(handle);
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách phiếu kỷ luật của sinh viên (trừ phiếu đã hủy).
 * @returns {Promise<Object>} { success, data: [] }
 */
export const getStudentDisciplinary = () =>
    fetch(`${API_BASE}/disciplinary`, { headers: headers() }).then(handle);

// ─────────────────────────────────────────────────────────────────────────────
// SỐ ĐIỆN / NƯỚC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sinh viên gửi số điện/nước trong 5 ngày đầu tháng.
 * @param {{ electric_end: number, water_end: number }} data
 * @returns {Promise<Object>} { success, message, data }
 */
export const submitMeterReading = (data) =>
    fetch(`${API_BASE}/invoices/meter-reading`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data),
    }).then(handle);

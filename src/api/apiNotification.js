import { BACKEND_URL } from "../utils/constants.jsx";

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Get ALL notifications (admin)
 */
export const getAllNotifications = async () => {
    const res = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Lỗi lấy danh sách thông báo");
    return data.data;
};

/**
 * Send notification to ALL students
 */
export const sendToAllStudents = async ({ title, content, type }) => {
    const res = await fetch(`${BACKEND_URL}/api/notifications/send-all`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content, type }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Lỗi gửi thông báo");
    return data.data;
};

/**
 * Send notification to SPECIFIC user IDs
 */
export const sendToSpecificUsers = async ({ title, content, type, userIds }) => {
    const res = await fetch(`${BACKEND_URL}/api/notifications/send-specific`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content, type, userIds }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Lỗi gửi thông báo");
    return data.data;
};

/**
 * Delete notification by ID
 */
export const deleteNotification = async (id) => {
    const res = await fetch(`${BACKEND_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Lỗi xóa thông báo");
    return data;
};

/**
 * Tìm kiếm sinh viên theo tên hoặc mã sinh viên thông qua API tìm kiếm hợp đồng
 * Trả về danh sách hợp đồng kèm student_name, user_id, snapshot_student_id
 */
export const searchStudentByCode = async (query) => {
    const res = await fetch(
        `${BACKEND_URL}/api/contracts?search=${encodeURIComponent(query)}`,
        { headers: getAuthHeaders() }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Lỗi tìm sinh viên");
    // Loại bỏ trùng lặp theo user_id để mỗi sinh viên chỉ xuất hiện một lần
    const seen = new Set();
    return (data.data || []).filter((c) => {
        if (!c.user_id || seen.has(c.user_id)) return false;
        seen.add(c.user_id);
        return true;
    });
};

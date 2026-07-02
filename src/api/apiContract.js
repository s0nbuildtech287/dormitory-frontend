/**
 * Contract Management API Functions
 */

import { API_BASE_URL } from "../config/api.js";

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
 * Get all contracts (optionally filter by status)
 * @param {Object} filters - { status, search, roomId }
 */
export const getContracts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.search) params.append("search", filters.search);
  if (filters.roomId) params.append("roomId", filters.roomId);

  const response = await fetch(`${API_BASE_URL}/contracts?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get pending contracts (waiting for room assignment)
 */
export const getPendingContracts = async () => {
  const response = await fetch(`${API_BASE_URL}/contracts/pending`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get contract statistics (count by status)
 */
export const getContractStats = async () => {
  const response = await fetch(`${API_BASE_URL}/contracts/stats`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get contract by ID (full details)
 */
export const getContractById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get top-5 suggested rooms for a Pending contract
 * (sorted by same-year cohort match + availability)
 */
export const getSuggestedRooms = async (contractId) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/suggest-rooms`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Assign a room to a Pending contract → becomes Active
 * @param {string} contractId
 * @param {string} roomId
 */
export const assignRoom = async (contractId, roomId) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/assign-room`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ room_id: roomId }),
  });
  return handleResponse(response);
};

/**
 * Update contract fields
 */
export const updateContract = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

/**
 * Terminate a contract
 */
export const terminateContract = async (id) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${id}/terminate`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get expiring contracts within N days
 */
export const getExpiringContracts = async (days = 30) => {
  const response = await fetch(`${API_BASE_URL}/contracts/expiring?days=${days}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Delete a contract
 */
export const deleteContract = async (id) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Revert contract: xóa hợp đồng, trả hồ sơ về "Chờ duyệt"
 * Chỉ cho phép khi Pending + chưa cọc + chưa bản cứng
 */
export const revertContract = async (id) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${id}/revert`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Gửi email nhắc gia hạn cho các hợp đồng sắp hết hạn
 * @param {string[]} contractIds - Danh sách ID hợp đồng
 */
export const sendRenewalEmails = async (contractIds) => {
  const response = await fetch(`${API_BASE_URL}/contracts/send-renewal-emails`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ contractIds }),
  });
  return handleResponse(response);
};

/**
 * Transfer an active contract to a new room
 * @param {string} contractId
 * @param {string} roomId
 */
export const transferRoom = async (contractId, roomId) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/transfer-room`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ room_id: roomId }),
  });
  return handleResponse(response);
};

/**
 * Rút phòng: đưa hợp đồng Active về Pending
 * @param {string} contractId
 */
export const unassignRoom = async (contractId) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/unassign-room`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * Set volunteer role for a student contract
 * @param {string} contractId
 * @param {string} volunteerRole - 'truong_xung_kich' or 'xung_kich'
 */
export const setVolunteerRole = async (contractId, volunteerRole) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/set-volunteer-role`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ volunteer_role: volunteerRole }),
  });
  return handleResponse(response);
};

/**
 * Gán phòng tự động cho hợp đồng Pending
 * @param {string|null} faculty - Lọc theo khoa (optional)
 */
export const autoAssignPendingContracts = async (faculty = null) => {
  const response = await fetch(`${API_BASE_URL}/contracts/auto-assign`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ faculty }),
  });
  return handleResponse(response);
};


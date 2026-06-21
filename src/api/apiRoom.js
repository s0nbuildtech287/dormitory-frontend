/**
 * Room Management API Functions
 * Centralized API calls for room-related operations
 */

import { API_BASE_URL } from "../config/api.js";

/**
 * Get auth token from localStorage
 * @returns {string|null}
 */
const getAuthToken = () => localStorage.getItem('token');

/**
 * Get all rooms
 * @returns {Promise<Object>} Response with rooms list
 */
export const getRooms = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải dữ liệu phòng');
    }

    return data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

/**
 * Get available rooms
 * @returns {Promise<Object>} Response with available rooms
 */
export const getAvailableRooms = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/available`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải dữ liệu phòng');
    }

    return data;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw error;
  }
};

/**
 * Get room by ID
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Response with room data
 */
export const getRoomById = async (roomId) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/${roomId}`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải dữ liệu phòng');
    }

    return data;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw error;
  }
};

/**
 * Create new room
 * @param {Object} roomData - Room data
 * @returns {Promise<Object>} Response with created room
 */
export const createRoom = async (roomData) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms`,
      { 
        method: 'POST',
        headers,
        body: JSON.stringify(roomData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tạo phòng');
    }

    return data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Get room structure metadata
 * @returns {Promise<Object>} Response with buildings/floors metadata
 */
export const getRoomStructure = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/meta/structure`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải cấu trúc tòa và tầng');
    }

    return data;
  } catch (error) {
    console.error('Error fetching room structure:', error);
    throw error;
  }
};

/**
 * Get display names for buildings
 */
export const getBuildingDisplayNames = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/settings/display-names`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải tên hiển thị tòa');
    }

    return data;
  } catch (error) {
    console.error('Error fetching building display names:', error);
    throw error;
  }
};

/**
 * Update display names for buildings
 * @param {Object} displayNames
 */
export const updateBuildingDisplayNames = async (displayNames) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/settings/display-names`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ displayNames })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lưu tên hiển thị tòa');
    }

    return data;
  } catch (error) {
    console.error('Error updating building display names:', error);
    throw error;
  }
};

/**
 * Create many rooms for one floor
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const createFloorRooms = async (payload) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/batch/floor`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi khởi tạo phòng cho tầng');
    }

    return data;
  } catch (error) {
    console.error('Error creating floor rooms:', error);
    throw error;
  }
};

/**
 * Create many rooms for one building
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const createBuildingRooms = async (payload) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/batch/building`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi khởi tạo phòng cho tòa');
    }

    return data;
  } catch (error) {
    console.error('Error creating building rooms:', error);
    throw error;
  }
};

/**
 * Update room
 * @param {string} roomId - Room ID
 * @param {Object} roomData - Room data to update
 * @returns {Promise<Object>} Response with updated room
 */
export const updateRoom = async (roomId, roomData) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/${roomId}`,
      { 
        method: 'PUT',
        headers,
        body: JSON.stringify(roomData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật phòng');
    }

    return data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

/**
 * Delete room
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Response
 */
export const deleteRoom = async (roomId) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/${roomId}`,
      { 
        method: 'DELETE',
        headers
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa phòng');
    }

    return data;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

/**
 * Get room statistics
 * @returns {Promise<Object>} Response with statistics
 */
export const getRoomStatistics = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/statistics`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải thống kê');
    }

    return data;
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    throw error;
  }
};

/**
 * Batch update reserved_for for rooms of a building or building/floor
 * @param {Object} payload { building, floor, reserved_for }
 * @returns {Promise<Object>}
 */
export const updateBatchReservedFor = async (payload) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(
      `${API_BASE_URL}/rooms/batch/reserved-for`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật hàng loạt đối tượng sử dụng');
    }

    return data;
  } catch (error) {
    console.error('Error in updateBatchReservedFor API call:', error);
    throw error;
  }
};

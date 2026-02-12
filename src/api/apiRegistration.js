/**
 * Registration Management API Functions
 * Centralized API calls for registration-related operations
 */

const API_BASE_URL = 'http://localhost:1234/api';

/**
 * Get auth token from localStorage
 * @returns {string|null}
 */
const getAuthToken = () => localStorage.getItem('token');

/**
 * Get registrations with filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.status - Registration status
 * @param {string} filters.gender - Gender filter
 * @param {string} filters.search - Search term
 * @param {string} filters.aiSuggestion - AI suggestion filter
 * @param {number} filters.limit - Limit results
 * @returns {Promise<Object>} Response with registrations list
 */
export const getRegistrations = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.search) params.append('search', filters.search);
    if (filters.aiSuggestion) params.append('aiSuggestion', filters.aiSuggestion);
    if (filters.limit) params.append('limit', filters.limit);

    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/registrations?${params.toString()}`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải dữ liệu');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Get registration by ID
 * @param {string} id - Registration ID
 * @returns {Promise<Object>} Registration data
 */
export const getRegistrationById = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/registrations/${id}`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không tìm thấy hồ sơ');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Create new registration
 * @param {Object} registrationData - Registration information
 * @returns {Promise<Object>} Created registration
 */
export const createRegistration = async (registrationData) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/registrations`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(registrationData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Tạo hồ sơ thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Update registration
 * @param {string} id - Registration ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated registration
 */
export const updateRegistration = async (id, updateData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const response = await fetch(
      `${API_BASE_URL}/registrations/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Cập nhật hồ sơ thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Approve registration
 * @param {string} id - Registration ID
 * @param {string} note - Admin note
 * @returns {Promise<Object>} Updated registration
 */
export const approveRegistration = async (id, note = null) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const response = await fetch(
      `${API_BASE_URL}/registrations/${id}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Duyệt hồ sơ thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Reject registration
 * @param {string} id - Registration ID
 * @param {string} note - Rejection reason
 * @returns {Promise<Object>} Updated registration
 */
export const rejectRegistration = async (id, note) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const response = await fetch(
      `${API_BASE_URL}/registrations/${id}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Từ chối hồ sơ thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Import registrations from CSV/Excel file
 * @param {File} file - CSV/Excel file
 * @returns {Promise<Object>} Import result with success count and errors
 */
export const importRegistrationFile = async (file) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE_URL}/registrations/import/excel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      } else if (response.status === 403) {
        throw new Error('Bạn không có quyền thực hiện chức năng này!');
      }
      throw new Error(data.message || 'Import thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Get registration statistics
 * @returns {Promise<Object>} Statistics data
 */
export const getRegistrationStatistics = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/registrations/statistics`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải thống kê');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Get registration scoring settings
 * @returns {Promise<Object>} Scoring weights configuration
 */
export const getScoringWeights = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(
      `${API_BASE_URL}/settings/scoring-weights`,
      { method: 'GET', headers }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tải cài đặt');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Update registration scoring settings
 * @param {Object} scoringWeights - Scoring weights configuration
 * @returns {Promise<Object>} Updated settings
 */
export const updateScoringWeights = async (scoringWeights) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const response = await fetch(
      `${API_BASE_URL}/settings/scoring-weights`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scoringWeights })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Cập nhật cài đặt thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Recalculate AI scores for all registrations
 * Used after updating scoring weights/settings
 * @returns {Promise<Object>} Recalculation result
 */
export const recalculateAllScores = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const response = await fetch(
      `${API_BASE_URL}/registrations/recalculate-scores`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Tính lại điểm thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Authentication API Functions
 * Centralized API calls for auth-related operations
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Admin login
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Response data with token and user info
 */
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Student login (if applicable)
 * @param {string} studentId - Student ID
 * @param {string} password - Student password
 * @returns {Promise<Object>} Response data with token and user info
 */
export const studentLogin = async (studentId, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Lỗi kết nối đến server');
  }
};

/**
 * Logout - Clear auth token
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get auth token from localStorage
 * @returns {string|null} Token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Save auth token to localStorage
 * @param {string} token - Auth token
 */
export const saveAuthToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Save user to localStorage
 * @param {Object} user - User object
 */
export const saveCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

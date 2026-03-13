/**
 * Asset Management API Functions
 * Centralized API calls for asset-related operations
 */

const API_BASE_URL = 'http://localhost:1234/api';

/**
 * Get auth token from localStorage
 * @returns {string|null}
 */
const getAuthToken = () => localStorage.getItem('token');

/**
 * Get all assets with optional filters
 * @param {Object} params - Query parameters (search, category, status, room_id, etc.)
 * @returns {Promise<Object>} Response with assets data
 */
export const getAssets = async (params = {}) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/assets?${queryString}` : `${API_BASE_URL}/assets`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
};

/**
 * Get asset by ID
 * @param {string} id - Asset ID
 * @returns {Promise<Object>} Asset data
 */
export const getAssetById = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/assets/${id}`, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching asset:", error);
    throw error;
  }
};

/**
 * Create new asset
 * @param {Object} assetData - Asset data
 * @returns {Promise<Object>} Created asset
 */
export const createAsset = async (assetData) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/assets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating asset:", error);
    throw error;
  }
};

/**
 * Update asset
 * @param {string} id - Asset ID
 * @param {Object} assetData - Updated asset data
 * @returns {Promise<Object>} Updated asset
 */
export const updateAsset = async (id, assetData) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating asset:", error);
    throw error;
  }
};

/**
 * Delete asset
 * @param {string} id - Asset ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteAsset = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw error;
  }
};

/**
 * Get asset statistics
 * @returns {Promise<Object>} Asset statistics
 */
export const getAssetStatistics = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/assets/statistics`, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching asset statistics:", error);
    throw error;
  }
};

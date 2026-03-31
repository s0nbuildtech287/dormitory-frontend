const API_BASE_URL = 'http://localhost:1234/api';
const getAuthToken = () => localStorage.getItem('token');

/**
 * Get activity logs with filters + pagination
 * @param {Object} params
 * @param {string}  params.search
 * @param {string}  params.userId    - filter by admin user id
 * @param {string}  params.action    - filter by action key
 * @param {string}  params.startDate - ISO date string
 * @param {string}  params.endDate   - ISO date string
 * @param {number}  params.page
 * @param {number}  params.limit
 */
export const getActivityLogs = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search)     query.set('search',     params.search);
    if (params.userId)     query.set('userId',     params.userId);
    if (params.action)     query.set('action',     params.action);
    if (params.startDate)  query.set('startDate',  params.startDate);
    if (params.endDate)    query.set('endDate',    params.endDate);
    if (params.page)       query.set('page',       params.page);
    if (params.limit)      query.set('limit',      params.limit);

    const res = await fetch(`${API_BASE_URL}/logs?${query.toString()}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return res.json();
};

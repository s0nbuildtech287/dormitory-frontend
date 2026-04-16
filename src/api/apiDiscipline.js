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
  if (!response.ok) {
    throw new Error(data.message || "Lỗi server");
  }
  return data;
};

export const getDisciplinaryRecords = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/disciplinary${query ? `?${query}` : ""}`, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const createDisciplinaryRecord = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/disciplinary`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const updateDisciplinaryRecord = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/disciplinary/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const deleteDisciplinaryRecord = async (id) => {
  const response = await fetch(`${API_BASE_URL}/disciplinary/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handleResponse(response);
};

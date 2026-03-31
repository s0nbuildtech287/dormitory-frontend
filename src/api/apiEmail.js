import { BACKEND_URL } from "../utils/constants.jsx";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Gửi email
 * @param {{ to: string | string[], subject: string, body: string }} params
 */
export const sendEmail = async ({ to, subject, body }) => {
  const res = await fetch(`${BACKEND_URL}/api/email/send`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ to, subject, body }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Gửi email thất bại");
  return data;
};

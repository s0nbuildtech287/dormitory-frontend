const API_BASE = "http://localhost:1234/api/vnpay";

const token = () => localStorage.getItem("token");
const headers = () => ({
  "Content-Type": "application/json",
  ...(token() && { Authorization: `Bearer ${token()}` }),
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi server");
  return data;
};

/**
 * Tạo URL thanh toán VNPay
 * @param {{ type: "invoice"|"deposit", id: string, amount: number, orderInfo: string }} payload
 * @returns {Promise<{ paymentUrl: string, txnRef: string }>}
 */
export const createVNPayPayment = (payload) =>
  fetch(`${API_BASE}/create-payment`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  }).then(handle).then((res) => res.data);

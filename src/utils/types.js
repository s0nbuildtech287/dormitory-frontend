export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  STAFF: "STAFF",
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
};

export const Gender = {
  MALE: "Nam",
  FEMALE: "Nữ",
};

export const RegistrationStatus = {
  PENDING: "Chờ duyệt",
  APPROVED: "Chấp nhận",
  REJECTED: "Từ chối",
};

export const AISuggestionType = {
  RECOMMENDED: "Nên duyệt",
  CONSIDER: "Cân nhắc",
  LOW_PRIORITY: "Không ưu tiên",
};

export const BillStatus = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
};

// Note: These are now plain JavaScript objects instead of TypeScript types
// Type definitions are implicit through usage

import { useNavigate } from "react-router-dom";
import { useNavigation } from "../contexts/NavigationContext.jsx";

/**
 * Hook tùy chỉnh hỗ trợ các điều hướng liên kết giữa các chức năng
 * Tập trung hóa các logic điều hướng liên kết trong ứng dụng
 */
export const useNavigationHandlers = () => {
  const navigate = useNavigate();
  const { setContractFilter, setInvoiceFilter, setNotificationData } = useNavigation();

  const handleNavigateToContract = (contractNumber) => {
    setContractFilter({ searchTerm: contractNumber });
    navigate("/students");
  };

  const handleNavigateToInvoice = (invoiceNumber) => {
    setInvoiceFilter({ searchTerm: invoiceNumber });
    navigate("/billing");
  };

  const handleNavigateToNotification = (data) => {
    setNotificationData(data);
    navigate("/notifications");
  };

  return {
    handleNavigateToContract,
    handleNavigateToInvoice,
    handleNavigateToNotification,
  };
};

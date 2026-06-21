import { useNavigate } from "react-router-dom";
import { useNavigation } from "../contexts/NavigationContext.jsx";

/**
 * Custom hook for navigation handlers
 * Centralizes all navigation logic
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

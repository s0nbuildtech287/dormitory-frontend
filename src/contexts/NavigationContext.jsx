import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  const [contractFilter, setContractFilter] = useState(null);
  const [invoiceFilter, setInvoiceFilter] = useState(null);
  const [notificationData, setNotificationData] = useState(null);
  
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "") || "dashboard";

  // Tự động xóa các bộ lọc điều hướng khi rời khỏi trang
  useEffect(() => {
    if (currentPath !== "students") setContractFilter(null);
    if (currentPath !== "billing") setInvoiceFilter(null);
    if (currentPath !== "notifications") setNotificationData(null);
  }, [currentPath]);

  return (
    <NavigationContext.Provider
      value={{
        contractFilter,
        setContractFilter,
        invoiceFilter,
        setInvoiceFilter,
        notificationData,
        setNotificationData,
        currentPath,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigation } from "../contexts/NavigationContext.jsx";
import { useNavigationHandlers } from "../hooks/useNavigationHandlers.js";
import { ADMIN_ROUTES, STUDENT_ROUTES } from "./index.js";
import { UserRole } from "../utils/types.js";
import ProfileAdmin from "../pages/profile_admin/index.jsx";
import PaymentResult from "../pages/payment/PaymentResult.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

/**
 * Component Cấu hình Tuyến đường (Route Config)
 * Quản lý render tất cả các route kèm theo các thuộc tính (props) tương ứng
 */
const RouteConfig = () => {
  const { user } = useAuth();
  const { contractFilter, invoiceFilter, notificationData } = useNavigation();
  const { handleNavigateToContract, handleNavigateToInvoice, handleNavigateToNotification } = useNavigationHandlers();

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.STAFF;
  const routes = isAdmin ? ADMIN_ROUTES : STUDENT_ROUTES;
  const defaultPath = isAdmin ? "/dashboard" : "/profile";

  const getProps = (routeId) => {
    const props = { user, tab: routeId };

    // Bổ sung các props đặc thù theo từng tuyến đường
    switch (routeId) {
      case "students":
        props.initialFilter = contractFilter;
        break;
      case "rooms":
        props.onNavigateToContract = handleNavigateToContract;
        props.onNavigateToInvoice = handleNavigateToInvoice;
        break;
      case "billing":
        props.onNavigateToContract = handleNavigateToContract;
        props.initialInvoiceFilter = invoiceFilter;
        props.onNavigateToNotification = handleNavigateToNotification;
        break;
      case "notifications":
        props.initialNotificationData = notificationData;
        break;
      default:
        break;
    }

    return props;
  };

  return (
    <Routes>
      {routes.map((route) => {
        // Render tuyến đường chính
        const mainRoute = (
          <Route
            key={route.id}
            path={route.path}
            element={<route.component {...getProps(route.id)} />}
          />
        );

        // Render các tuyến đường con (submenu) nếu có
        const submenuRoutes = route.submenu?.map((subRoute) => (
          <Route
            key={subRoute.id}
            path={subRoute.path}
            element={<subRoute.component {...getProps(subRoute.id)} />}
          />
        ));

        return (
          <React.Fragment key={route.id}>
            {mainRoute}
            {submenuRoutes}
          </React.Fragment>
        );
      })}
      
      {/* Tuyến đường hồ sơ cá nhân Admin */}
      <Route path="/profile-admin" element={<ProfileAdmin user={user} />} />

      {/* Tuyến đường kết quả thanh toán VNPay */}
      <Route path="/payment/result" element={<PaymentResult />} />
      
      {/* Điều hướng mặc định nếu không khớp route */}
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
};

export default RouteConfig;

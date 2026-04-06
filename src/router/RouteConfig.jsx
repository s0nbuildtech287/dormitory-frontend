import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigation } from "../contexts/NavigationContext.jsx";
import { useNavigationHandlers } from "../hooks/useNavigationHandlers.js";
import { ADMIN_ROUTES, STUDENT_ROUTES } from "./index.js";
import { UserRole } from "../utils/types.js";
import ProfileAdmin from "../pages/profile_admin/index.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

/**
 * Route Configuration Component
 * Handles all route rendering with proper props
 */
const RouteConfig = () => {
  const { user } = useAuth();
  const { contractFilter, invoiceFilter, notificationData } = useNavigation();
  const { handleNavigateToContract, handleNavigateToInvoice, handleNavigateToNotification } = useNavigationHandlers();

  const routes = user?.role === UserRole.ADMIN ? ADMIN_ROUTES : STUDENT_ROUTES;
  const defaultPath = user?.role === UserRole.ADMIN ? "/dashboard" : "/profile";

  const getProps = (routeId) => {
    const props = { user, tab: routeId };

    // Add specific props based on route
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
        // Render main route
        const mainRoute = (
          <Route
            key={route.id}
            path={route.path}
            element={<route.component {...getProps(route.id)} />}
          />
        );

        // Render submenu routes if they exist
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
      
      {/* Profile Admin Route */}
      <Route path="/profile-admin" element={<ProfileAdmin user={user} />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
};

export default RouteConfig;

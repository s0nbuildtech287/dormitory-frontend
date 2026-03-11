import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AIChatBot from "./components/AIChatBot.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import ProfileAdmin from "./pages/profile_admin/index.jsx";
import { UserRole } from "./utils/types.js";
import { ADMIN_ROUTES, STUDENT_ROUTES } from "./router/index.js";
import { getCurrentUser } from "./api/apiAuth.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contractFilter, setContractFilter] = useState(null);
  const [invoiceFilter, setInvoiceFilter] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Current active tab derived from URL path
  const currentPath = location.pathname.replace("/", "") || "dashboard";

  /**
   * Handle navigation to contract page with filter
   */
  const handleNavigateToContract = (contractNumber) => {
    setContractFilter({ searchTerm: contractNumber });
    navigate("/students");
  };

  /**
   * Handle navigation to billing page with filter
   */
  const handleNavigateToInvoice = (invoiceNumber) => {
    setInvoiceFilter({ searchTerm: invoiceNumber });
    navigate("/billing");
  };

  /** Reset filters when leaving their pages */
  useEffect(() => {
    if (currentPath !== "students") setContractFilter(null);
    if (currentPath !== "billing") setInvoiceFilter(null);
  }, [currentPath]);

  /** Check for existing session on app mount */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const savedUser = getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleLogin = (userData) => {
    setUser(userData);
    const initialPath = userData.role === UserRole.ADMIN ? "/dashboard" : "/profile";
    navigate(initialPath);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const routes = user.role === UserRole.ADMIN ? ADMIN_ROUTES : STUDENT_ROUTES;
  const defaultPath = user.role === UserRole.ADMIN ? "/dashboard" : "/profile";

  const getProps = (routeId) => {
    const props = { user, tab: routeId };
    if (routeId === "students") props.initialFilter = contractFilter;
    if (routeId === "rooms") {
      props.onNavigateToContract = handleNavigateToContract;
      props.onNavigateToInvoice = handleNavigateToInvoice;
    }
    if (routeId === "billing") {
      props.onNavigateToContract = handleNavigateToContract;
      props.initialInvoiceFilter = invoiceFilter;
    }
    return props;
  };

  return (
    <>
      <Layout user={user} onLogout={handleLogout}>
        <div className="animate-in fade-in duration-500">
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.id}
                path={route.path}
                element={<route.component {...getProps(route.id)} />}
              />
            ))}
            {/* Profile Admin Route */}
            <Route
              path="/profile-admin"
              element={<ProfileAdmin user={user} onLogout={handleLogout} />}
            />
            {/* Default redirect */}
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </div>
      </Layout>
      <AIChatBot />
    </>
  );
};

export default App;

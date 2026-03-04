import React, { useState, useEffect } from "react";
import Layout from "./components/Layout.jsx";
import AIChatBot from "./components/AIChatBot.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import { UserRole } from "./utils/types.js";
import { getComponentByRouteId } from "./router/index.js";
import { getCurrentUser } from "./api/apiAuth.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [contractFilter, setContractFilter] = useState(null);

  /**
   * Handle navigation to contract page with filter
   */
  const handleNavigateToContract = (contractNumber) => {
    setContractFilter({ searchTerm: contractNumber });
    setActiveTab("students");
  };

  /**
   * Check for existing session on app mount
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const savedUser = getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
        const initialTab = savedUser.role === UserRole.ADMIN ? "dashboard" : "profile";
        setActiveTab(initialTab);
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * Handle login and set initial active tab
   */
  const handleLogin = (userData) => {
    setUser(userData);
    const initialTab = userData.role === UserRole.ADMIN ? "dashboard" : "profile";
    setActiveTab(initialTab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    const Component = getComponentByRouteId(activeTab, user.role);
    if (!Component) {
      const defaultTab = user.role === UserRole.ADMIN ? "dashboard" : "profile";
      const DefaultComponent = getComponentByRouteId(defaultTab, user.role);
      return DefaultComponent ? <DefaultComponent user={user} tab={activeTab} /> : <div className="text-center py-10">Trang không tìm thấy</div>;
    }
    
    // Pass special props based on tab
    const props = { user, tab: activeTab };
    if (activeTab === "students") {
      props.initialFilter = contractFilter;
    }
    if (activeTab === "rooms") {
      props.onNavigateToContract = handleNavigateToContract;
    }
    
    return <Component {...props} />;
  };

  return (
    <>
      <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="animate-in fade-in duration-500">{renderContent()}</div>
      </Layout>
      <AIChatBot />
    </>
  );
};

export default App;

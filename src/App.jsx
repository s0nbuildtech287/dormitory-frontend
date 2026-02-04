import React, { useState } from "react";
import Layout from "./components/Layout.jsx";
import AIChatBot from "./components/AIChatBot.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import { UserRole } from "./utils/types.js";
import { getComponentByRouteId } from "./router/index.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
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
    return <Component user={user} tab={activeTab} />;
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

import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { NavigationProvider } from "./contexts/NavigationContext.jsx";
import Layout from "./components/Layout.jsx";
import AIChatBot from "./components/AIChatBot.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RouteConfig from "./router/RouteConfig.jsx";

/**
 * Main App Component - Refactored
 * Simplified with Context API and custom hooks
 */
const AppContent = () => {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <>
      <Layout user={user} onLogout={logout}>
        <div className="animate-in fade-in duration-500">
          <RouteConfig />
        </div>
      </Layout>
      <AIChatBot />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
};

export default App;

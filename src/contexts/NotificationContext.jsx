import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const NotificationContext = createContext(null);

const SOCKET_URL = "http://localhost:1234";

export const NotificationProvider = ({ user, children }) => {
    const [notifications, setNotifications] = useState([]);   // thông báo từ WS (session only)
    const [adminAlerts, setAdminAlerts]     = useState([]);   // alert cho admin
    const [unreadCount, setUnreadCount]     = useState(0);
    const socketRef = useRef(null);

    const addNotification = useCallback((notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(c => c + 1);
    }, []);

    const addAdminAlert = useCallback((alert) => {
        setAdminAlerts(prev => [alert, ...prev.slice(0, 19)]); // max 20
        setUnreadCount(c => c + 1);
    }, []);

    const clearUnread = useCallback(() => setUnreadCount(0), []);

    const clearAdminAlerts = useCallback(() => {
        setAdminAlerts([]);
        setUnreadCount(0);
    }, []);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket"],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("[WS] Connected:", socket.id);
        });

        socket.on("notification", (data) => {
            addNotification(data);
        });

        socket.on("admin_alert", (data) => {
            addAdminAlert(data);
        });

        socket.on("connect_error", (err) => {
            console.warn("[WS] Connect error:", err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user, addNotification, addAdminAlert]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            adminAlerts,
            unreadCount,
            clearUnread,
            clearAdminAlerts,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
    return ctx;
};

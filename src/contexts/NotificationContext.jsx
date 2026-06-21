import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api.js";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ user, children }) => {
    const [notifications, setNotifications] = useState([]);   // thông báo từ WS (session only)
    const [adminAlerts, setAdminAlerts]     = useState([]);   // alert cho admin
    const [unreadCount, setUnreadCount]     = useState(0);
    const [highPriorityToasts, setHighPriorityToasts] = useState([]); // toast cảnh báo high priority
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

    const dismissHighPriorityToast = useCallback((id) => {
        setHighPriorityToasts(prev => prev.filter(t => t.id !== id));
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

        socket.on("high_priority_feedback", (data) => {
            const toast = { ...data, id: Date.now() + Math.random() };
            setHighPriorityToasts(prev => [toast, ...prev].slice(0, 5));
            setTimeout(() => {
                setHighPriorityToasts(prev => prev.filter(t => t.id !== toast.id));
            }, 8000);
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
            highPriorityToasts,
            dismissHighPriorityToast,
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

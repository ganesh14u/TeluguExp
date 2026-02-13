"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Notification {
    _id: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    orderId?: string;
}

interface UserNotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

const UserNotificationContext = createContext<UserNotificationContextType | undefined>(undefined);

export function UserNotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        if (!session?.user) return;
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch user notifications", error);
        }
    }, [session?.user]);

    useEffect(() => {
        fetchNotifications();
        // Poll every 1 minute for user notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n._id !== id));
            }
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const clearAll = async () => {
        try {
            const res = await fetch("/api/notifications", {
                method: "DELETE"
            });
            if (res.ok) {
                setNotifications([]);
            }
        } catch (error) {
            console.error("Failed to clear all notifications", error);
        }
    };

    const unreadCount = notifications.length;

    return (
        <UserNotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
            {children}
        </UserNotificationContext.Provider>
    );
}

export function useUserNotifications() {
    const context = useContext(UserNotificationContext);
    if (context === undefined) {
        throw new Error("useUserNotifications must be used within a UserNotificationProvider");
    }
    return context;
}

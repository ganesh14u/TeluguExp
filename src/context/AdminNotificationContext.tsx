"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Notification {
    id: string;
    title: string;
    description: string;
    time: Date;
    read: false;
}

interface AdminNotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const lastCheckedRef = useRef<Date>(new Date());
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const isAdmin = session?.user?.role === 'admin';

    useEffect(() => {
        if (!isAdmin) return;

        audioRef.current = new Audio(NOTIFICATION_SOUND);

        const checkNewOrders = async () => {
            try {
                const res = await fetch(`/api/orders?after=${lastCheckedRef.current.toISOString()}`);
                const newOrders = await res.json();

                if (Array.isArray(newOrders) && newOrders.length > 0) {
                    const newNotifications: Notification[] = newOrders.map((order: any) => ({
                        id: order._id,
                        title: `New Order: ₹${order.totalPrice}`,
                        description: `From ${order.shippingAddress?.name || 'Guest'}`,
                        time: new Date(order.createdAt),
                        read: false
                    }));

                    setNotifications(prev => [...newNotifications, ...prev]);
                    lastCheckedRef.current = new Date();

                    audioRef.current?.play().catch(() => { });
                    toast.success("New Order Received!", {
                        description: `Order total: ₹${newOrders[0].totalPrice}`
                    });
                }
            } catch (error) {
                console.error("Failed to check notifications", error);
            }
        };

        checkNewOrders();
        const intervalId = setInterval(checkNewOrders, 5000);
        return () => clearInterval(intervalId);
    }, [isAdmin]);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.length;

    return (
        <AdminNotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
            {children}
        </AdminNotificationContext.Provider>
    );
}

export function useAdminNotifications() {
    const context = useContext(AdminNotificationContext);
    if (context === undefined) {
        throw new Error("useAdminNotifications must be used within an AdminNotificationProvider");
    }
    return context;
}

"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    BarChart3,
    Image as ImageIcon,
    MessageSquare,
    Gift
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Protected route: check for admin
    if (session?.user?.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <AdminSidebar />
            <div className="grow flex flex-col min-h-screen">
                <main className="grow p-8">
                    <div className="container mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

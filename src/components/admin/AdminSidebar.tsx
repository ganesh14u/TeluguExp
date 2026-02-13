"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Gift,
    Image as ImageIcon,
    MessageSquare,
    LogOut,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Categories", href: "/admin/categories", icon: Settings },
    { name: "Coupons", href: "/admin/coupons", icon: Gift },
    { name: "CMS / Pages", href: "/admin/cms", icon: ImageIcon },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
];

import { useAdminNotifications } from "@/context/AdminNotificationContext";

export function AdminSidebar() {
    const pathname = usePathname();
    const { unreadCount } = useAdminNotifications();

    return (
        <aside className="w-64 border-r bg-muted/30 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Settings className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase">Telugu Admin</span>
                </Link>
            </div>

            <ScrollArea className="grow px-4">
                <div className="space-y-1 py-4">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const isOrders = link.name === "Orders";

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-primary"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "group-hover:text-primary")} />
                                    {link.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isOrders && unreadCount > 0 && (
                                        <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-in zoom-in duration-300">
                                            {unreadCount}
                                        </span>
                                    )}
                                    {isActive && <ChevronRight className="h-4 w-4" />}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="p-4 border-t space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="h-4 w-4" />
                    Logout Admin
                </Button>
                <Link href="/" className="flex items-center justify-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest hover:text-primary transition-colors py-2">
                    ← View Public Store
                </Link>
            </div>
        </aside>
    );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Package, MapPin, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) return null;

    const navLinks = [
        { name: "Overview", href: "/account", icon: User },
        { name: "My Orders", href: "/account/orders", icon: Package },
        { name: "Saved Addresses", href: "/account/addresses", icon: MapPin },
        { name: "Account Settings", href: "/account/settings", icon: Settings },
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar - Quick Links */}
                <aside className="md:col-span-1">
                    <Card className="rounded-[2rem] border-2 overflow-hidden bg-white sticky top-24">
                        <CardHeader className="border-b border-dashed p-6 bg-muted/10">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Quick <span className="text-primary NOT-italic">Links</span></CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${isActive
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            <link.icon className="h-4 w-4" /> {link.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content */}
                <main className="md:col-span-3">
                    {children}
                </main>
            </div>
        </div>
    );
}

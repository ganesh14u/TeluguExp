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
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-72 space-y-4">
                    <Card className="rounded-3xl border-2 overflow-hidden bg-white">
                        <CardHeader className="bg-muted/30 p-8 flex flex-col items-center border-b border-dashed">
                            <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center mb-4 relative group">
                                <User className="h-12 w-12 text-primary" />
                                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 group-hover:rotate-180 transition-transform duration-1000" />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">{session.user.name}</CardTitle>
                            <p className="text-sm text-muted-foreground font-bold">{session.user.email}</p>
                            {session.user.role === 'admin' && (
                                <div className="mt-4 flex items-center gap-1.5 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <Shield className="h-3 w-3" /> Management
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-3">
                            <nav className="space-y-1">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${isActive
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            <link.icon className="h-4 w-4" /> {link.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content */}
                <main className="grow">
                    {children}
                </main>
            </div>
        </div>
    );
}

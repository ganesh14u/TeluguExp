"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, Heart, Zap, ShoppingBag, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import CartSheet from "@/components/cart/CartSheet";
import WishlistSheet from "@/components/wishlist/WishlistSheet";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const cart = useCart();
    const wishlist = useWishlist();

    useEffect(() => {
        setMounted(true);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Telugu Experiments"
                        className="h-10 w-10 object-contain"
                    />
                    <span className="hidden sm:block text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Telugu Experiments
                    </span>
                </Link>

                {/* Desktop Navigation */}
                {!pathname.startsWith('/admin') && (
                    <nav className="hidden md:flex items-center space-x-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-slate-500"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2">
                    {!pathname.startsWith('/admin') ? (
                        <>
                            <Button variant="ghost" size="icon" className="hidden sm:flex">
                                <Search className="h-5 w-5" />
                            </Button>

                            <WishlistSheet>
                                <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                                    <Heart className="h-5 w-5" />
                                    {mounted && wishlist.items.length > 0 && (
                                        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                                            {wishlist.items.length}
                                        </span>
                                    )}
                                </Button>
                            </WishlistSheet>

                            <CartSheet>
                                <Button variant="ghost" size="icon" className="relative">
                                    <ShoppingCart className="h-5 w-5" />
                                    {mounted && cart.totalItems() > 0 && (
                                        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                                            {cart.totalItems()}
                                        </span>
                                    )}
                                </Button>
                            </CartSheet>
                        </>
                    ) : (
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
                        </Button>
                    )}

                    {session ? (
                        <div className="flex items-center space-x-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">
                                        <User className="h-5 w-5 text-primary" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 border-2" align="end">
                                    <DropdownMenuLabel className="p-3">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-black uppercase tracking-tight">{session.user?.name}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground truncate">{session.user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/account" className="flex items-center gap-2 p-3 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                                            <User className="h-4 w-4" /> Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/account/orders" className="flex items-center gap-2 p-3 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                                            <ShoppingCart className="h-4 w-4" /> Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 p-3 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 transition-all">
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {session.user?.role === 'admin' && (
                                <Link href={pathname.startsWith('/admin') ? "/" : "/admin"}>
                                    <Button variant="default" size="sm" className="hidden md:flex font-black uppercase tracking-tighter italic h-9 rounded-xl">
                                        {pathname.startsWith('/admin') ? "Home" : "Admin"}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm">Login</Button>
                        </Link>
                    )}

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col space-y-4 mt-8">
                                {!pathname.startsWith('/admin') && (
                                    <>
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className="text-lg font-medium hover:text-primary"
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                        {!session && (
                                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                                <Button className="w-full">Login / Signup</Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                                {session && (
                                    <>
                                        <Link href="/account" onClick={() => setIsOpen(false)}>Account</Link>
                                        <Link href="/account/orders" onClick={() => setIsOpen(false)}>Orders</Link>
                                        {session.user?.role === 'admin' && (
                                            <Link
                                                href={pathname.startsWith('/admin') ? "/" : "/admin"}
                                                onClick={() => setIsOpen(false)}
                                                className="text-primary font-black uppercase tracking-tighter"
                                            >
                                                {pathname.startsWith('/admin') ? "Back to Home Site" : "Admin Dashboard"}
                                            </Link>
                                        )}
                                        <Button variant="ghost" onClick={() => signOut()} className="justify-start px-0 font-bold text-red-500">Logout</Button>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Header;

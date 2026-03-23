"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, Heart, Zap, ShoppingBag, Bell, Check, FlaskConical, ArrowRight } from "lucide-react";
import { LayoutDashboard, Package, Users as UsersIcon, Settings as SettingsIcon, Gift, Image as ImageIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminNotifications } from "@/context/AdminNotificationContext";
import { useUserNotifications } from "@/context/UserNotificationContext";
import { format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import {
    Dialog as SearchDialog,
    DialogContent as SearchDialogContent,
    DialogTitle as SearchDialogTitle,
    DialogHeader as SearchDialogHeader
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
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
import { useCurrency } from "@/context/CurrencyContext";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdminSheetOpen, setIsAdminSheetOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const cart = useCart();
    const wishlist = useWishlist();
    const { formatPrice } = useCurrency();
    const { notifications, unreadCount, markAsRead, clearAll } = useAdminNotifications();
    const { notifications: userNotifs, unreadCount: userUnread, markAsRead: markUserRead, clearAll: clearUserAll } = useUserNotifications();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await fetch(`/api/products?q=${searchQuery}`);
                const data = await res.json();
                setSearchResults(data.slice(0, 5)); // Show top 5
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <>
        <header className={`fixed md:sticky top-0 z-50 w-full transition-all duration-300 ${
            scrolled 
            ? "bg-background/50 backdrop-blur md:border-b" 
            : "bg-transparent border-none md:border-b"
        } pointer-events-none md:pointer-events-auto`}>
            <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between relative pointer-events-auto">
                {/* Logo */}
                <Link href="/" className="absolute left-1/2 -translate-x-1/2 inset-y-0 md:static md:translate-x-0 md:inset-y-auto flex items-center gap-3 group">
                    <img
                        src="/logo.png"
                        alt="Telugu Adventures"
                        className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-2xl mix-blend-multiply bg-transparent group-hover:scale-110 transition-transform duration-500"
                    />
                    <span className="hidden lg:block text-xl font-black bg-linear-to-r from-primary to-amber-500 bg-clip-text text-transparent italic tracking-tighter">
                        Telugu Adventures
                    </span>
                </Link>

                {/* Desktop Navigation */}
                {!pathname.startsWith('/admin') && (
                    <nav className="hidden md:flex items-center space-x-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-xs font-bold capitalize tracking-widest transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-slate-500"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2">
                    {!pathname.startsWith('/admin') && (
                        <div className="hidden md:flex items-center space-x-2">
                            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hidden sm:flex transition-all hover:bg-primary/10 hover:text-primary rounded-full"
                                    onClick={() => setIsSearchOpen(true)}
                                >
                                    <Search className="h-5 w-5" />
                                </Button>
                                <SearchDialogContent className="sm:max-w-[550px] p-0 gap-0 border-2 rounded-3xl overflow-hidden shadow-2xl bg-white/95 backdrop-blur-xl">
                                    <SearchDialogHeader className="p-4 pr-12 border-b bg-slate-50/50 relative">
                                        <SearchDialogTitle className="sr-only">Search Products</SearchDialogTitle>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Search for science kits, projects..."
                                                className="pl-10 h-12 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-xl font-bold italic"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                autoFocus
                                            />
                                            {isSearching && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                                            )}
                                        </div>
                                    </SearchDialogHeader>

                                    <div className="max-h-[60vh] overflow-y-auto">
                                        {searchQuery.length >= 2 ? (
                                            <div className="p-2">
                                                {searchResults.length > 0 ? (
                                                    <div className="space-y-1">
                                                        <p className="px-3 py-2 text-[10px] font-black capitalize tracking-widest text-slate-400 italic">Matching Products</p>
                                                        {searchResults.map((p) => (
                                                            <Link
                                                                key={p._id}
                                                                href={`/product/${p.slug}`}
                                                                onClick={() => setIsSearchOpen(false)}
                                                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 group transition-all"
                                                            >
                                                                <div className="h-12 w-12 rounded-lg overflow-hidden border bg-white shrink-0">
                                                                    <img src={p.image || p.images?.[0]} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                </div>
                                                                <div className="flex flex-col flex-1 min-w-0">
                                                                    <span className="font-black capitalize tracking-tight text-sm truncate group-hover:text-primary transition-colors">{p.name}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 capitalize italic">{p.category}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-black text-sm italic">{formatPrice(p.discountPrice || p.price)}</p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                        <Link
                                                            href={`/shop?q=${searchQuery}`}
                                                            onClick={() => setIsSearchOpen(false)}
                                                            className="flex items-center justify-center p-3 text-[10px] font-black capitalize tracking-widest text-primary hover:bg-primary/10 rounded-xl mt-2 transition-all"
                                                        >
                                                            View All Results
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="py-12 text-center">
                                                        <Search className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                                        <p className="text-sm font-black capitalize italic text-slate-400">No matching experiments found</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : searchQuery.length > 0 ? (
                                            <div className="py-8 text-center">
                                                <p className="text-[10px] font-bold capitalize tracking-widest text-slate-400 italic">Type at least 2 characters...</p>
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center space-y-4">
                                                <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search className="h-8 w-8 text-primary/20" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 capitalize tracking-widest">Start typing to search products</p>
                                            </div>
                                        )}
                                    </div>
                                </SearchDialogContent>
                            </SearchDialog>

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
                        </div>
                    )}

                    <div className="hidden md:flex items-center space-x-2">
                    {session?.user?.role === 'admin' ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative transition-all hover:bg-primary/10 hover:text-primary rounded-full">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[9px] font-black text-white flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 rounded-2xl p-0 overflow-hidden border-2 shadow-2xl bg-white" align="end">
                                <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[10px] capitalize tracking-[0.2em] opacity-60">Notifications</h3>
                                        <p className="text-xs font-bold">{unreadCount} New Orders</p>
                                    </div>
                                    {notifications.length > 0 && (
                                        <Button onClick={clearAll} variant="ghost" className="h-8 px-3 rounded-lg text-[10px] font-black capitalize tracking-widest hover:bg-white/10 text-white border border-white/20">
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Bell className="h-6 w-6 text-slate-300" />
                                            </div>
                                            <p className="text-[10px] font-black capitalize tracking-widest text-slate-400">All caught up!</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif: any) => (
                                            <div key={notif.id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-all group relative">
                                                <div className="flex justify-between items-start mb-1 pr-8">
                                                    <span className="font-black text-sm text-slate-950">{notif.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold capitalize">{format(notif.time, 'HH:mm')}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mb-2">{notif.description}</p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="h-7 px-3 rounded-lg bg-primary text-[10px] font-black capitalize tracking-widest text-white hover:bg-primary/90"
                                                    >
                                                        <Check className="h-3 w-3 mr-1" /> Mark Read
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : session ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative transition-all hover:bg-primary/10 hover:text-primary rounded-full">
                                    <Bell className="h-5 w-5" />
                                    {userUnread > 0 && (
                                        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[9px] font-black text-white flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                                            {userUnread}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 rounded-2xl p-0 overflow-hidden border-2 shadow-2xl bg-white" align="end">
                                <div className="bg-primary text-white p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-[10px] capitalize tracking-[0.2em] opacity-60">Alerts</h3>
                                        <p className="text-xs font-bold">{userUnread} New Updates</p>
                                    </div>
                                    {userNotifs.length > 0 && (
                                        <Button onClick={clearUserAll} variant="ghost" className="h-8 px-3 rounded-lg text-[10px] font-black capitalize tracking-widest hover:bg-white/10 text-white border border-white/20">
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {userNotifs.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Bell className="h-6 w-6 text-slate-300" />
                                            </div>
                                            <p className="text-[10px] font-black capitalize tracking-widest text-slate-400">No new alerts</p>
                                        </div>
                                    ) : (
                                        userNotifs.map((notif: any) => (
                                            <div key={notif._id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-all group relative">
                                                <div className="flex justify-between items-start mb-1 pr-2">
                                                    <span className="font-black text-sm text-slate-950">{notif.title}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold capitalize">{format(new Date(notif.createdAt), 'HH:mm')}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mb-2">{notif.message}</p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => markUserRead(notif._id)}
                                                        className="h-7 px-3 rounded-lg bg-primary text-[10px] font-black capitalize tracking-widest text-white hover:bg-primary/90"
                                                    >
                                                        <Check className="h-3 w-3 mr-1" /> Mark Read
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : null}

                    {session ? (
                        <div className="items-center space-x-2 hidden md:flex">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors p-0 overflow-hidden">
                                        {session.user?.image ? (
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-5 w-5 text-primary" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 border-2" align="end">
                                    <DropdownMenuLabel className="p-3">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-black capitalize tracking-tight">{session.user?.name}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground truncate">{session.user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/account" className="flex items-center gap-2 p-3 rounded-xl cursor-pointer font-bold text-xs capitalize tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                                            <User className="h-4 w-4" /> Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/account/orders" className="flex items-center gap-2 p-3 rounded-xl cursor-pointer font-bold text-xs capitalize tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                                            <ShoppingCart className="h-4 w-4" /> Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 p-3 rounded-xl cursor-pointer font-bold text-xs capitalize tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 transition-all">
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {session.user?.role === 'admin' && (
                                <Link href={pathname.startsWith('/admin') ? "/" : "/admin"}>
                                    <Button variant="default" size="sm" className="hidden md:flex font-black capitalize tracking-tighter italic h-9 rounded-xl">
                                        {pathname.startsWith('/admin') ? "Home" : "Admin"}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="hidden md:flex">
                            <Link href="/login">
                                <Button size="sm">Login</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 border-l-0 w-[85%] sm:w-[400px] bg-slate-950 text-white">
                            <SheetHeader className="p-8 border-b border-white/5">
                                <SheetTitle className="text-left font-black capitalize tracking-tighter text-base flex items-center gap-2">
                                    <img src="/logo.png" alt="Telugu Adventures" className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col h-[calc(100vh-100px)] justify-between p-8">
                                <div className="space-y-6">
                                    {!pathname.startsWith('/admin') ? (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black capitalize tracking-[0.3em] text-white/30 mb-6">Explore Site</p>
                                            {navLinks.map((link) => (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`block text-lg font-black capitalize italic tracking-tighter transition-all ${pathname === link.href ? 'text-primary' : 'text-white hover:text-primary'}`}
                                                >
                                                    {link.name}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black capitalize tracking-[0.3em] text-primary mb-6">Admin Panel</p>
                                            <Link href="/admin" onClick={() => setIsOpen(false)} className="block text-lg font-black capitalize italic tracking-tighter text-white hover:text-primary transition-all">Dashboard</Link>
                                            <Link href="/admin/products" onClick={() => setIsOpen(false)} className="block text-lg font-black capitalize italic tracking-tighter text-white hover:text-primary transition-all">Products</Link>
                                            <Link href="/admin/orders" onClick={() => setIsOpen(false)} className="block text-lg font-black capitalize italic tracking-tighter text-white hover:text-primary transition-all">Orders</Link>
                                            <Link href="/admin/coupons" onClick={() => setIsOpen(false)} className="block text-lg font-black capitalize italic tracking-tighter text-white hover:text-primary transition-all">Coupons</Link>
                                            <Link href="/" onClick={() => setIsOpen(false)} className="block text-sm font-black capitalize tracking-widest text-primary pt-10">← Back to Store</Link>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6 border-t border-white/5 pt-8">
                                    {session ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="h-12 w-12 rounded-2xl bg-white/10 overflow-hidden border border-white/10">
                                                    {session.user?.image ? <img src={session.user.image} className="h-full w-full object-cover" alt="" /> : <User className="h-full w-full p-3 text-white/40" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black capitalize tracking-tight">{session.user?.name}</span>
                                                    <span className="text-[10px] font-bold text-white/40 capitalize tracking-widest">Active Session</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center justify-center h-12 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black capitalize tracking-widest hover:bg-white/10 transition-all">Profile</Link>
                                                <Link href="/account/orders" onClick={() => setIsOpen(false)} className="flex items-center justify-center h-12 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black capitalize tracking-widest hover:bg-white/10 transition-all">Orders</Link>
                                            </div>
                                            <Button variant="ghost" onClick={() => signOut()} className="w-full h-12 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 font-black capitalize text-[10px] tracking-[0.2em] transition-all">Sign Out Account</Button>
                                        </div>
                                    ) : (
                                        <Link href="/login" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full h-16 rounded-2xl font-black capitalize italic text-lg shadow-2xl shadow-primary/20">
                                                Join The Lab <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    </div>
                </div>
            </div>
        </header>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-100 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)] pb-safe supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16 px-1">
                <Link href="/" className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-primary transition-colors">
                    <div className={`p-1.5 rounded-xl transition-all ${pathname === '/' ? 'bg-primary/10 text-primary' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <span className={`text-[9px] mt-0.5 font-bold ${pathname === '/' ? 'text-primary' : ''}`}>Home</span>
                </Link>

                <CartSheet>
                    <button className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-primary transition-colors relative group">
                        <div className="p-1.5 rounded-xl group-active:scale-95 transition-transform relative">
                            <ShoppingCart className="h-[20px] w-[20px] stroke-[2px]" />
                            {mounted && cart.totalItems() > 0 && (
                                <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    {cart.totalItems()}
                                </span>
                            )}
                        </div>
                        <span className="text-[9px] mt-0.5 font-bold">Cart</span>
                    </button>
                </CartSheet>

                {session ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-primary transition-colors relative group">
                                <div className="p-1.5 rounded-xl group-active:scale-95 transition-transform relative">
                                    <Bell className="h-[20px] w-[20px] stroke-[2px]" />
                                    {(session.user.role === 'admin' ? unreadCount : userUnread) > 0 && (
                                        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            {session.user.role === 'admin' ? unreadCount : userUnread}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[9px] mt-0.5 font-bold">Alerts</span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-32px)] ml-4 mr-4 mb-2 rounded-3xl p-0 overflow-hidden border-0 shadow-2xl bg-white z-110" align="center" sideOffset={10}>
                            {session.user.role === 'admin' ? (
                                <>
                                    <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-black text-[10px] capitalize tracking-[0.2em] opacity-60">Admin Notifications</h3>
                                            <p className="text-xs font-bold">{unreadCount} New Orders</p>
                                        </div>
                                        {notifications.length > 0 && (
                                            <Button onClick={clearAll} variant="ghost" className="h-8 px-3 rounded-lg text-[10px] font-black capitalize tracking-widest hover:bg-white/10 text-white border border-white/20">
                                                Clear All
                                            </Button>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-12 text-center">
                                                <Bell className="h-6 w-6 text-slate-300 mx-auto" />
                                                <p className="text-[10px] mt-2 font-black tracking-widest text-slate-400 text-center">All caught up!</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif: any) => (
                                                <div key={notif.id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-all">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-black text-xs">{notif.title}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold">{format(notif.time, 'HH:mm')}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-medium mb-3 line-clamp-2">{notif.description}</p>
                                                    <Button onClick={() => markAsRead(notif.id)} className="h-7 px-3 w-full rounded-lg bg-primary text-[10px] font-black tracking-widest text-white">
                                                        <Check className="h-3 w-3 mr-1" /> Mark Read
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-primary text-white p-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-black text-[10px] capitalize tracking-[0.2em] opacity-60">Alerts</h3>
                                            <p className="text-xs font-bold">{userUnread} New Updates</p>
                                        </div>
                                        {userNotifs.length > 0 && (
                                            <Button onClick={clearUserAll} variant="ghost" className="h-8 px-3 rounded-lg text-[10px] font-black capitalize tracking-widest hover:bg-white/10 text-white border border-white/20">
                                                Clear All
                                            </Button>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {userNotifs.length === 0 ? (
                                            <div className="p-12 text-center">
                                                <Bell className="h-6 w-6 text-slate-300 mx-auto" />
                                                <p className="text-[10px] mt-2 font-black tracking-widest text-slate-400 text-center">No new alerts</p>
                                            </div>
                                        ) : (
                                            userNotifs.map((notif: any) => (
                                                <div key={notif._id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-all">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-black text-xs">{notif.title}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold">{format(new Date(notif.createdAt), 'HH:mm')}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-medium mb-3 line-clamp-2">{notif.message}</p>
                                                    <Button onClick={() => markUserRead(notif._id)} className="h-7 px-3 w-full rounded-lg bg-primary text-[10px] font-black tracking-widest text-white">
                                                        <Check className="h-3 w-3 mr-1" /> Mark Read
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Link href="/login" className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-primary transition-colors">
                        <div className="p-1.5 rounded-xl transition-all">
                            <Bell className="h-[20px] w-[20px] stroke-[2px]" />
                        </div>
                        <span className="text-[9px] mt-0.5 font-bold">Alerts</span>
                    </Link>
                )}

                {session ? (
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-primary transition-colors">
                                <div className={`p-1.5 rounded-xl transition-all ${pathname.startsWith('/account') && !pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : ''}`}>
                                    {session.user?.image ? (
                                        <img src={session.user.image} className="h-5 w-5 rounded-full object-cover shadow-sm border border-slate-200" alt="Profile" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={pathname.startsWith('/account') && !pathname.startsWith('/admin') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    )}
                                </div>
                                <span className={`text-[9px] mt-0.5 font-bold ${pathname.startsWith('/account') && !pathname.startsWith('/admin') ? 'text-primary' : ''}`}>
                                    Profile
                                </span>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="z-110 rounded-t-3xl bg-slate-50 text-slate-950 p-0 border-t-0 max-h-[85vh] overflow-y-auto w-full">
                            <SheetHeader className="p-6 border-b border-slate-200 sticky top-0 bg-white z-20">
                                <SheetTitle className="text-left flex items-center gap-4">
                                    {session.user?.image ? (
                                        <img src={session.user.image} className="h-12 w-12 rounded-full object-cover shadow-md border-2 border-slate-100" alt="Profile" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-black text-lg capitalize tracking-tight leading-none">{session.user?.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground mt-1 truncate max-w-[200px]">{session.user?.email}</span>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="p-6 pb-20 space-y-3">
                                <SheetClose asChild>
                                    <Link href="/account" className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 hover:border-primary/50 transition-all font-black text-slate-700 hover:text-primary shadow-sm group">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                            <User className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                        </div>
                                        My Profile Details
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link href="/account/orders" className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 hover:border-primary/50 transition-all font-black text-slate-700 hover:text-primary shadow-sm group">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                            <ShoppingCart className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                        </div>
                                        Order History
                                    </Link>
                                </SheetClose>
                                <Button 
                                    variant="outline" 
                                    onClick={() => signOut()} 
                                    className="flex items-center justify-start gap-4 p-4 h-auto rounded-2xl border-2 bg-red-50 border-red-100 hover:bg-red-500 hover:text-white text-red-500 font-black mt-2 shadow-sm transition-all group w-full"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                                    </div>
                                    Sign Out Account
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                ) : (
                    <Link href="/login" className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-primary transition-colors">
                        <div className={`p-1.5 rounded-xl transition-all ${pathname.startsWith('/login') ? 'bg-primary/10 text-primary' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={pathname.startsWith('/login') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <span className={`text-[9px] mt-0.5 font-bold ${pathname.startsWith('/login') ? 'text-primary' : ''}`}>
                            Sign In
                        </span>
                    </Link>
                )}

                {session?.user?.role === 'admin' && (
                    <Sheet open={isAdminSheetOpen} onOpenChange={setIsAdminSheetOpen}>
                        <SheetTrigger asChild>
                            <button className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-primary transition-colors">
                                <div className={`p-1.5 rounded-xl transition-all ${pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : ''}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={pathname.startsWith('/admin') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
                                </div>
                                <span className={`text-[9px] mt-0.5 font-bold ${pathname.startsWith('/admin') ? 'text-primary' : ''}`}>
                                    Admin
                                </span>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="z-110 rounded-t-3xl bg-slate-950 text-white p-0 border-t-0 max-h-[85vh] overflow-y-auto w-full">
                            <SheetHeader className="p-6 border-b border-white/5 sticky top-0 bg-slate-950 z-20">
                                <SheetTitle className="text-left font-black capitalize tracking-tighter text-white flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                        <SettingsIcon className="h-5 w-5 text-white" />
                                    </div>
                                    Telugu Admin
                                </SheetTitle>
                            </SheetHeader>
                            <div className="p-6 pb-20 grid grid-cols-2 gap-3">
                                {[
                                    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
                                    { name: "Products", href: "/admin/products", icon: Package },
                                    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
                                    { name: "Users", href: "/admin/users", icon: UsersIcon },
                                    { name: "Categories", href: "/admin/categories", icon: SettingsIcon },
                                    { name: "Coupons", href: "/admin/coupons", icon: Gift },
                                    { name: "CMS / Pages", href: "/admin/cms", icon: ImageIcon },
                                    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
                                ].map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsAdminSheetOpen(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all ${pathname === link.href ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'}`}
                                    >
                                        <link.icon className="h-6 w-6" />
                                        <span className="text-[10px] font-black capitalize tracking-widest text-center">{link.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </div>
        </>
    );
};

export default Header;

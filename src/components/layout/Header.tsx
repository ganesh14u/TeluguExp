"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, Heart, Zap, ShoppingBag, Bell, Check } from "lucide-react";
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

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const cart = useCart();
    const wishlist = useWishlist();
    const { notifications, unreadCount, markAsRead, clearAll } = useAdminNotifications();
    const { notifications: userNotifs, unreadCount: userUnread, markAsRead: markUserRead, clearAll: clearUserAll } = useUserNotifications();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
                    {!pathname.startsWith('/admin') && (
                        <>
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
                                                        <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Matching Products</p>
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
                                                                    <span className="font-black uppercase tracking-tight text-sm truncate group-hover:text-primary transition-colors">{p.name}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase italic">{p.category}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-black text-sm italic">₹{(p.discountPrice || p.price).toLocaleString()}</p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                        <Link
                                                            href={`/shop?q=${searchQuery}`}
                                                            onClick={() => setIsSearchOpen(false)}
                                                            className="flex items-center justify-center p-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl mt-2 transition-all"
                                                        >
                                                            View All Results
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="py-12 text-center">
                                                        <Search className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                                        <p className="text-sm font-black uppercase italic text-slate-400">No matching experiments found</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : searchQuery.length > 0 ? (
                                            <div className="py-8 text-center">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Type at least 2 characters...</p>
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center space-y-4">
                                                <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search className="h-8 w-8 text-primary/20" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start typing to search products</p>
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
                        </>
                    )}

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
                                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Notifications</h3>
                                        <p className="text-xs font-bold">{unreadCount} New Orders</p>
                                    </div>
                                    {notifications.length > 0 && (
                                        <Button onClick={clearAll} variant="ghost" className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-white border border-white/20">
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
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All caught up!</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif: any) => (
                                            <div key={notif.id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-all group relative">
                                                <div className="flex justify-between items-start mb-1 pr-8">
                                                    <span className="font-black text-sm text-slate-950">{notif.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{format(notif.time, 'HH:mm')}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mb-2">{notif.description}</p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="h-7 px-3 rounded-lg bg-primary text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary/90"
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
                                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Alerts</h3>
                                        <p className="text-xs font-bold">{userUnread} New Updates</p>
                                    </div>
                                    {userNotifs.length > 0 && (
                                        <Button onClick={clearUserAll} variant="ghost" className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-white border border-white/20">
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
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No new alerts</p>
                                        </div>
                                    ) : (
                                        userNotifs.map((notif: any) => (
                                            <div key={notif._id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-all group relative">
                                                <div className="flex justify-between items-start mb-1 pr-2">
                                                    <span className="font-black text-sm text-slate-950">{notif.title}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase">{format(new Date(notif.createdAt), 'HH:mm')}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mb-2">{notif.message}</p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => markUserRead(notif._id)}
                                                        className="h-7 px-3 rounded-lg bg-primary text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary/90"
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
                        <div className="flex items-center space-x-2">
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
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation Menu</SheetTitle>
                            </SheetHeader>
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

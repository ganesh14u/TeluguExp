"use client";

import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function WishlistSheet({ children }: { children: React.ReactNode }) {
    const wishlist = useWishlist();
    const cart = useCart();

    const handleAddToCart = (product: any) => {
        cart.addItem(product, 1);
        toast.success(`${product.name} added to cart!`);
        wishlist.removeItem(product._id);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-white/10 bg-white/95 backdrop-blur-xl h-full">
                {/* Header */}
                <SheetHeader className="px-6 py-5 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                    <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-xl">
                                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-black uppercase tracking-widest text-sm">My Wishlist</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                    {wishlist.items.length} Saved Items
                                </span>
                            </div>
                        </div>
                        {wishlist.items.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    wishlist.clearWishlist();
                                    toast.success("Wishlist cleared");
                                }}
                                className="text-[10px] text-red-500 hover:text-red-600 font-bold uppercase tracking-widest h-8 px-3 hover:bg-red-50"
                            >
                                Clear All
                            </Button>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {/* Items Area */}
                <div className="flex-1 overflow-hidden relative w-full bg-slate-50/50">
                    <ScrollArea className="h-full w-full">
                        <div className="px-6 min-h-full">
                            {wishlist.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
                                    <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative">
                                        <Heart className="h-12 w-12 text-slate-300" />
                                        <div className="absolute top-0 right-0 h-32 w-32 border-2 border-dashed border-red-200 rounded-full animate-spin-slow pointer-events-none opacity-50" />
                                    </div>
                                    <div className="space-y-2 max-w-[250px]">
                                        <h3 className="font-black text-xl uppercase italic tracking-tighter">Wishlist is Empty</h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                            Found anything you liked? Save your favorites here to find them easily later.
                                        </p>
                                    </div>
                                    <SheetTrigger asChild>
                                        <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/10" variant="outline">
                                            Continue Browsing
                                        </Button>
                                    </SheetTrigger>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-5 py-6">
                                    {wishlist.items.map((item) => (
                                        <div key={item._id} className="group relative flex gap-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-red-100">
                                            {/* Image */}
                                            <div className="h-24 w-24 rounded-xl overflow-hidden border bg-slate-50 shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex flex-col flex-1 gap-1 py-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <Link href={`/product/${item.slug}`} className="font-bold text-sm hover:text-primary line-clamp-2 leading-snug uppercase tracking-tight">
                                                        {item.name}
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            wishlist.removeItem(item._id);
                                                            toast.success("Removed from wishlist");
                                                        }}
                                                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-auto">
                                                    {item.category || "Science Kit"}
                                                </div>

                                                <div className="flex items-end justify-between mt-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm text-slate-900 italic">
                                                            ₹{(item.discountPrice || item.price).toLocaleString()}
                                                        </span>
                                                        {item.discountPrice && (
                                                            <span className="text-[9px] text-slate-300 line-through font-bold tracking-tight">
                                                                ₹{item.price.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAddToCart(item)}
                                                        className="h-9 px-4 rounded-xl font-black uppercase italic tracking-widest text-[9px] bg-slate-900 hover:bg-primary transition-all group/btn"
                                                    >
                                                        <ShoppingBag className="h-3 w-3 mr-1.5 text-primary group-hover/btn:text-white transition-colors" /> Add to Cart
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                {wishlist.items.length > 0 && (
                    <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20 shrink-0">
                        <div className="space-y-4">
                            <SheetTrigger asChild>
                                <Link href="/wishlist" className="block">
                                    <Button className="w-full h-14 rounded-2xl text-sm font-black uppercase italic tracking-widest shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all hover:scale-[1.02] flex items-center justify-between px-6 bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white group">
                                        <span>Go to My Wishlist</span>
                                        <ArrowRight className="h-5 w-5 bg-slate-100 group-hover:bg-white/20 rounded-full p-1 transition-colors" />
                                    </Button>
                                </Link>
                            </SheetTrigger>

                            <SheetTrigger asChild>
                                <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                                    Continue Shopping
                                </Button>
                            </SheetTrigger>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

"use client";

import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function CartSheet({ children }: { children: React.ReactNode }) {
    const cart = useCart();

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
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-black uppercase tracking-widest text-sm">My Cart</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                    {cart.totalItems()} Items
                                </span>
                            </div>
                        </div>
                        {cart.items.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    cart.clearCart();
                                    toast.success("Cart cleared");
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
                            {cart.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
                                    <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative">
                                        <ShoppingBag className="h-12 w-12 text-slate-300" />
                                        <div className="absolute top-0 right-0 h-32 w-32 border-2 border-dashed border-slate-200 rounded-full animate-spin-slow pointer-events-none" />
                                    </div>
                                    <div className="space-y-2 max-w-[250px]">
                                        <h3 className="font-black text-xl uppercase italic tracking-tighter">Your Bag is Empty</h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                            Looks like you haven't discovered our awesome gadgets yet.
                                        </p>
                                    </div>
                                    <SheetTrigger asChild>
                                        <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
                                            Start Exploring
                                        </Button>
                                    </SheetTrigger>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-5 py-6">
                                    {cart.items.map((item) => (
                                        <div key={item._id} className="group relative flex gap-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-primary/20">
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
                                                        onClick={() => cart.removeItem(item._id)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-auto">
                                                    Science Kit
                                                </div>

                                                <div className="flex items-end justify-between mt-2">
                                                    {/* Quantity Control */}
                                                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                                                        <button
                                                            onClick={() => cart.updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                                            className="p-1 hover:bg-white rounded-md transition-colors text-slate-500 hover:text-black"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-xs font-black min-w-[12px] text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => {
                                                                if (item.stock && item.quantity >= item.stock) {
                                                                    toast.error("Stock Limit Reached", { description: `Only ${item.stock} items available.` });
                                                                    return;
                                                                }
                                                                cart.updateQuantity(item._id, item.quantity + 1);
                                                            }}
                                                            className="p-1 hover:bg-white rounded-md transition-colors text-slate-500 hover:text-black"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-sm">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
                                                        {item.quantity > 1 && (
                                                            <span className="text-[9px] text-muted-foreground font-medium">
                                                                ₹{(item.discountPrice || item.price).toLocaleString()} / ea
                                                            </span>
                                                        )}
                                                    </div>
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
                {cart.items.length > 0 && (
                    <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20 shrink-0">
                        <div className="space-y-4">
                            <div className="space-y-2 pb-4 border-b border-dashed border-slate-200">
                                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    <span>Subtotal</span>
                                    <span>₹{cart.totalPrice().toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    <span>Shipping</span>
                                    <span className="text-green-500">Free</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-black uppercase italic tracking-tighter">Total Amount</span>
                                <span className="text-2xl font-black text-primary italic tracking-tight">₹{cart.totalPrice().toLocaleString()}</span>
                            </div>

                            <SheetTrigger asChild>
                                <Link href="/checkout" className="block">
                                    <Button className="w-full h-14 rounded-2xl text-sm font-black uppercase italic tracking-widest shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] flex items-center justify-between px-6">
                                        <span>Checkout Securely</span>
                                        <ArrowRight className="h-5 w-5 bg-white/20 rounded-full p-1" />
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

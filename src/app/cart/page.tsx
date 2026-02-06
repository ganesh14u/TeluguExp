"use client";

import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">Bag is <span className="text-primary NOT-italic">Empty</span></h1>
                <p className="text-muted-foreground font-bold mb-8 uppercase tracking-widest text-xs">Seems like you haven't added anything to your cart yet.</p>
                <Link href="/shop">
                    <Button size="lg" className="h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase italic pr-4">Shopping <span className="text-primary NOT-italic">Cart</span></h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <div key={item._id} className="flex gap-6 p-6 border-2 rounded-[2rem] bg-white transition-all hover:border-primary/20">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 bg-muted shrink-0 shadow-sm">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col justify-between grow">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h3 className="font-black text-lg sm:text-xl line-clamp-1 uppercase tracking-tight italic">{item.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Authentic Gear</p>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item._id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div className="flex items-center border-2 rounded-xl p-1 bg-muted/30">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg hover:bg-white"
                                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-10 text-center font-black text-sm italic">{item.quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg hover:bg-white"
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-2xl text-primary tracking-tighter italic">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</p>
                                        {item.discountPrice && (
                                            <p className="text-[10px] text-muted-foreground line-through font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="rounded-[2.5rem] bg-slate-900 border-none p-10 text-white sticky top-24 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShoppingBag className="h-24 w-24" />
                        </div>
                        <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">Order Summary</h2>
                        <div className="space-y-5">
                            <div className="flex justify-between text-white/60 font-bold text-xs uppercase tracking-widest">
                                <span>Subtotal ({totalItems()} items)</span>
                                <span className="text-white">₹{totalPrice().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-white/60 font-bold text-xs uppercase tracking-widest">
                                <span>Shipping Fees</span>
                                <span className="text-green-400">FREE</span>
                            </div>
                            <Separator className="bg-white/10 my-6" />
                            <div className="flex justify-between text-3xl font-black italic">
                                <span className="uppercase tracking-tighter">Total</span>
                                <span className="text-primary tracking-tighter">₹{totalPrice().toLocaleString()}</span>
                            </div>

                            <Link href="/checkout" className="block mt-10">
                                <Button className="w-full h-16 rounded-2xl text-lg font-black uppercase italic tracking-widest shadow-xl shadow-primary/40 hover:scale-[1.02] transition-transform">
                                    Secure Checkout <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>

                            <div className="mt-10 space-y-4 pt-10 border-t border-white/5">
                                <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-widest">
                                    <div className="h-2 w-2 rounded-full bg-green-500" /> Secure Payments
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-widest">
                                    <div className="h-2 w-2 rounded-full bg-green-500" /> Easy Returns
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

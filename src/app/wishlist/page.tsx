"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, ShoppingBag, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlist();
    const cart = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-red-300 fill-red-100" />
                </div>
                <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">Wishlist is <span className="text-red-500 NOT-italic">Empty</span></h1>
                <p className="text-muted-foreground font-bold mb-8 uppercase tracking-widest text-xs">You haven't saved any items yet.</p>
                <Link href="/shop">
                    <Button size="lg" className="h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20">
                        Explore Shop
                    </Button>
                </Link>
            </div>
        );
    }

    const handleAddToCart = (item: any) => {
        cart.addItem(item, 1);
        toast.success("Added to cart", {
            action: {
                label: "View Cart",
                onClick: () => window.location.href = "/cart"
            }
        });
        removeItem(item._id);
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic pr-4">My <span className="text-red-500 NOT-italic">Wishlist</span></h1>
                <Button variant="ghost" className="text-red-500 hover:text-red-600 font-black uppercase tracking-[0.2em] text-[9px] md:text-xs shrink-0 p-0" onClick={clearWishlist}>
                    Clear Wishlist
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {items.map((item) => (
                    <div key={item._id} className="group relative bg-white border-2 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1">
                        <div className="aspect-square bg-muted relative overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                            <button
                                onClick={() => removeItem(item._id)}
                                className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-sm hover:scale-110 transition-transform opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5 md:p-6">
                            <div className="mb-4">
                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{item.category}</p>
                                <Link href={`/product/${item.slug}`}>
                                    <h3 className="font-black text-lg md:text-xl leading-tight line-clamp-1 uppercase italic hover:text-primary transition-colors">{item.name}</h3>
                                </Link>
                            </div>

                            <div className="flex items-end justify-between gap-4 mt-auto">
                                <div>
                                    <p className="font-black text-xl md:text-2xl tracking-tighter italic">₹{(item.discountPrice || item.price).toLocaleString()}</p>
                                    {item.discountPrice && (
                                        <p className="text-[10px] md:text-xs text-muted-foreground line-through font-bold">₹{item.price.toLocaleString()}</p>
                                    )}
                                </div>
                                <Button
                                    className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-xs h-10 px-4 md:px-6 shadow-lg shadow-primary/10"
                                    onClick={() => handleAddToCart(item)}
                                >
                                    <ShoppingBag className="mr-2 h-3.5 md:h-4 w-3.5 md:w-4" /> Add
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 md:mt-16 text-center">
                <Link href="/shop">
                    <Button variant="outline" size="lg" className="h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-xs border-2">
                        Explore Shop <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

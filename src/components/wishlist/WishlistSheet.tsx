"use client";

import { Heart, ShoppingBag, X } from "lucide-react";
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
        toast.success("Added to cart");
        wishlist.removeItem(product._id); // Optional: remove from wishlist after adding to cart
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                        Wishlist
                        <span className="ml-auto text-sm font-medium text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                            {wishlist.items.length} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    {wishlist.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                            <div className="bg-red-50 p-4 rounded-full">
                                <Heart className="h-10 w-10 text-red-300 fill-red-100" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">Your wishlist is empty</h3>
                                <p className="text-sm text-muted-foreground">
                                    Start saving your favorite items for later.
                                </p>
                            </div>
                            <SheetTrigger asChild>
                                <Button className="mt-4" variant="outline">Browse Products</Button>
                            </SheetTrigger>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 py-6">
                            {wishlist.items.map((item) => (
                                <div key={item._id} className="relative group flex gap-4 border p-2 rounded-xl bg-card hover:bg-accent/50 transition-colors">
                                    <button
                                        onClick={() => {
                                            wishlist.removeItem(item._id);
                                            toast.success("Removed from wishlist");
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-red-50 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>

                                    <div className="h-24 w-24 rounded-lg overflow-hidden border bg-muted shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 gap-1 py-1">
                                        <Link href={`/product/${item.slug}`} className="font-semibold hover:text-primary line-clamp-2 leading-tight pr-4">
                                            {item.name}
                                        </Link>

                                        <div className="mt-auto flex items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg">₹{(item.discountPrice || item.price).toLocaleString()}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="rounded-full font-bold"
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                <ShoppingBag className="h-3 w-3 mr-1" /> Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {wishlist.items.length > 0 && (
                    <div className="p-6 border-t bg-background mt-auto">
                        <SheetTrigger asChild>
                            <Link href="/wishlist">
                                <Button variant="outline" className="w-full">View Full Wishlist</Button>
                            </Link>
                        </SheetTrigger>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

"use client";

import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function CartSheet({ children }: { children: React.ReactNode }) {
    const cart = useCart();

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Shopping Cart
                        <span className="ml-auto text-sm font-medium text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                            {cart.totalItems()} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                            <div className="bg-secondary p-4 rounded-full">
                                <ShoppingCart className="h-10 w-10 text-muted-foreground opacity-50" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">Your cart is empty</h3>
                                <p className="text-sm text-muted-foreground">
                                    Looks like you haven't added anything yet.
                                </p>
                            </div>
                            <SheetTrigger asChild>
                                <Button className="mt-4" variant="outline">Start Shopping</Button>
                            </SheetTrigger>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 py-6">
                            {cart.items.map((item) => (
                                <div key={item._id} className="flex gap-4">
                                    <div className="h-20 w-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 gap-1">
                                        <Link href={`/product/${item.slug}`} className="font-semibold hover:text-primary line-clamp-2 leading-tight">
                                            {item.name}
                                        </Link>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="font-bold">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
                                                {item.quantity > 1 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        ₹{(item.discountPrice || item.price).toLocaleString()} each
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 border rounded-md p-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-sm"
                                                    onClick={() => {
                                                        if (item.quantity > 1) {
                                                            cart.updateQuantity(item._id, item.quantity - 1);
                                                        } else {
                                                            cart.removeItem(item._id);
                                                        }
                                                    }}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-sm"
                                                    onClick={() => cart.updateQuantity(item._id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-6 border-t bg-background mt-auto">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="text-xl font-black">₹{cart.totalPrice().toLocaleString()}</span>
                        </div>
                        <SheetTrigger asChild>
                            <Link href="/cart">
                                <Button className="w-full text-base font-bold h-12" size="lg" disabled={cart.items.length === 0}>
                                    Checkout Now
                                </Button>
                            </Link>
                        </SheetTrigger>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="w-full">Continue Shopping</Button>
                        </SheetTrigger>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

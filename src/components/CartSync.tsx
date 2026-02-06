"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

export default function CartSync() {
    const { data: session, status } = useSession();
    const { items: cartItems, setItems: setCartItems, clearCart } = useCart();
    const { items: wishlistItems, setItems: setWishlistItems, clearWishlist } = useWishlist();

    const prevStatus = useRef(status);
    const isFirstRender = useRef(true);

    // Sync from DB on Login / Clear on Logout
    useEffect(() => {
        if (status === 'authenticated' && prevStatus.current !== 'authenticated') {
            // User just logged in

            // 1. Sync Cart
            fetch('/api/users/cart')
                .then(res => res.json())
                .then(dbCart => {
                    if (Array.isArray(dbCart)) {
                        if (cartItems.length > 0) {
                            // Merge local cart with DB cart
                            const mergedItems = [...cartItems];

                            dbCart.forEach((dbItem: any) => {
                                const existingIndex = mergedItems.findIndex(i => i._id === dbItem._id);
                                if (existingIndex > -1) {
                                    // Local takes precedence for quantity if conflict, or keep local
                                } else {
                                    mergedItems.push(dbItem);
                                }
                            });
                            setCartItems(mergedItems);
                        } else if (dbCart.length > 0) {
                            setCartItems(dbCart);
                        }
                    }
                })
                .catch(err => console.error("Failed to sync cart login", err));

            // 2. Sync Wishlist
            fetch('/api/users/wishlist')
                .then(res => res.json())
                .then(dbWishlist => {
                    if (Array.isArray(dbWishlist)) {
                        if (wishlistItems.length > 0) {
                            // Merge local wishlist with DB wishlist (Union)
                            const mergedWishlist = [...wishlistItems];

                            dbWishlist.forEach((dbItem: any) => {
                                if (!mergedWishlist.some(i => i._id === dbItem._id)) {
                                    mergedWishlist.push(dbItem);
                                }
                            });
                            setWishlistItems(mergedWishlist);
                        } else if (dbWishlist.length > 0) {
                            setWishlistItems(dbWishlist);
                        }
                    }
                })
                .catch(err => console.error("Failed to sync wishlist login", err));

        } else if (status === 'unauthenticated' && prevStatus.current === 'authenticated') {
            // User just logged out
            clearCart();
            clearWishlist();
        }
        prevStatus.current = status;
    }, [status, cartItems.length, wishlistItems.length, setCartItems, setWishlistItems, clearCart, clearWishlist]);

    // Sync Cart TO DB on changes
    useEffect(() => {
        if (status !== 'authenticated') return;
        if (isFirstRender.current) return;

        const timeoutId = setTimeout(() => {
            fetch('/api/users/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cartItems })
            }).catch(e => console.error("Failed to save cart", e));
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [cartItems, status]);

    // Sync Wishlist TO DB on changes
    useEffect(() => {
        if (status !== 'authenticated') return;
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            fetch('/api/users/wishlist', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: wishlistItems })
            }).catch(e => console.error("Failed to save wishlist", e));
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [wishlistItems, status]);

    return null;
}

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

export default function CartSync() {
    const { data: session, status } = useSession();
    const { items: cartItems, setItems: setCartItems, clearCart } = useCart();
    const { items: wishlistItems, setItems: setWishlistItems, clearWishlist } = useWishlist();

    // Track if the user was explicitly authenticated at some point in this session
    // This helps us distinguish between "initial guest load" and "user logged out"
    const wasAuthenticated = useRef(false);

    // Prevent initial render from triggering a SAVE to DB
    const isFirstRender = useRef(true);

    // Refs to hold current items for DB sync logic to avoid stale closures without triggering re-runs
    const cartItemsRef = useRef(cartItems);
    const wishlistItemsRef = useRef(wishlistItems);
    const hasFetchedOnLogin = useRef(false);

    useEffect(() => {
        cartItemsRef.current = cartItems;
    }, [cartItems]);

    useEffect(() => {
        wishlistItemsRef.current = wishlistItems;
    }, [wishlistItems]);

    // 1. TRACK AUTH STATUS to detect when to allow logout cleanup
    useEffect(() => {
        if (status === 'authenticated') {
            wasAuthenticated.current = true;
        }
    }, [status]);

    // 2. FETCH FROM DB ON LOGIN (or Mount if Authenticated)
    useEffect(() => {
        if (status === 'authenticated' && !hasFetchedOnLogin.current) {
            hasFetchedOnLogin.current = true;

            // Sync Cart
            fetch('/api/users/cart', { cache: 'no-store' })
                .then(res => res.json())
                .then(dbCart => {
                    if (Array.isArray(dbCart)) {
                        const currentLocalItems = cartItemsRef.current;

                        if (currentLocalItems.length > 0) {
                            const mergedItems = [...currentLocalItems];
                            let changed = false;
                            dbCart.forEach((dbItem: any) => {
                                const exists = mergedItems.some(i => i._id === dbItem._id);
                                if (!exists) {
                                    mergedItems.push(dbItem);
                                    changed = true;
                                }
                            });
                            if (changed) setCartItems(mergedItems);
                        } else if (dbCart.length > 0) {
                            setCartItems(dbCart);
                        }
                    }
                })
                .catch(err => console.error("Failed to sync cart login", err));

            // Sync Wishlist
            fetch('/api/users/wishlist', { cache: 'no-store' })
                .then(res => res.json())
                .then(dbWishlist => {
                    if (Array.isArray(dbWishlist)) {
                        const currentLocalItems = wishlistItemsRef.current;

                        if (currentLocalItems.length > 0) {
                            const mergedItems = [...currentLocalItems];
                            let changed = false;
                            dbWishlist.forEach((dbItem: any) => {
                                if (!mergedItems.some(i => i._id === dbItem._id)) {
                                    mergedItems.push(dbItem);
                                    changed = true;
                                }
                            });
                            if (changed) setWishlistItems(mergedItems);
                        } else if (dbWishlist.length > 0) {
                            setWishlistItems(dbWishlist);
                        }
                    }
                })
                .catch(err => console.error("Failed to sync wishlist login", err));
        } else if (status === 'unauthenticated') {
            hasFetchedOnLogin.current = false;
        }
    }, [status, setCartItems, setWishlistItems]);

    // 3. CLEAR LOCAL STATE ON LOGOUT
    useEffect(() => {
        if (status === 'unauthenticated' && wasAuthenticated.current) {
            // User just logged out
            clearCart();
            clearWishlist();
            wasAuthenticated.current = false;
        }
    }, [status, clearCart, clearWishlist]);

    // 4. SAVE CART TO DB ON CHANGES
    useEffect(() => {
        if (status !== 'authenticated') return;

        // Skip the very first render cycle to avoid saving initial state immediately
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            fetch('/api/users/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cartItems })
            }).catch(e => console.error("Failed to save cart", e));
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [cartItems, status]);

    // 5. SAVE WISHLIST TO DB ON CHANGES
    useEffect(() => {
        if (status !== 'authenticated') return;
        if (isFirstRender.current) return;

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


"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";

export default function CartSync() {
    const { data: session, status } = useSession();
    const { items, setItems, clearCart } = useCart();
    const prevStatus = useRef(status);
    const isFirstRender = useRef(true);

    // Sync from DB on Login / Clear on Logout
    useEffect(() => {
        if (status === 'authenticated' && prevStatus.current !== 'authenticated') {
            // User just logged in
            fetch('/api/users/cart')
                .then(res => res.json())
                .then(dbCart => {
                    if (Array.isArray(dbCart)) {
                        if (items.length > 0) {
                            // Merge local cart with DB cart
                            const mergedItems = [...items];

                            dbCart.forEach((dbItem: any) => {
                                const existingIndex = mergedItems.findIndex(i => i._id === dbItem._id);
                                if (existingIndex > -1) {
                                    // If item exists, keep the larger quantity or sum?
                                    // Let's protect the user's current session intent usually. 
                                    // But safe bet is "max" or "sum". Let's sum.
                                    mergedItems[existingIndex].quantity += dbItem.quantity;
                                } else {
                                    mergedItems.push(dbItem);
                                }
                            });
                            setItems(mergedItems);
                        } else if (dbCart.length > 0) {
                            // Local empty, just restore DB
                            setItems(dbCart);
                        }
                    }
                })
                .catch(err => console.error("Failed to sync cart login", err));
        } else if (status === 'unauthenticated' && prevStatus.current === 'authenticated') {
            // User just logged out
            clearCart();
        }
        prevStatus.current = status;
    }, [status, items.length, setItems, clearCart]); // items.length in dep array might be risky if items change rapidly during login? 
    // Actually, we want snapshot of items AT MOMENT of login.
    // The effect runs when status changes. 'items' current value will be used.
    // WARNING: 'items' in dependency array means if items change while status is fluctuating this might re-run? 
    // No, status check guards it.

    // Sync TO DB on changes
    useEffect(() => {
        if (status !== 'authenticated') return;

        // Skip the very first render to avoid double-save if data is just loading
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            fetch('/api/users/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            }).catch(e => console.error("Failed to save cart", e));
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [items, status]);

    return null;
}

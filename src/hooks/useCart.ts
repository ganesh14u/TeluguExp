import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    image: string;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (product: any, quantity: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setItems: (items: CartItem[]) => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, quantity) => {
                const { items } = get();
                const existingItem = items.find((item) => item._id === product._id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, { ...product, quantity }] });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item._id !== productId) });
            },
            updateQuantity: (productId, quantity) => {
                set({
                    items: get().items.map((item) =>
                        item._id === productId ? { ...item, quantity } : item
                    ),
                });
            },
            setItems: (items) => set({ items }),
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () =>
                get().items.reduce(
                    (acc, item) => acc + (item.discountPrice || item.price) * item.quantity,
                    0
                ),
        }),
        {
            name: "cart-storage",
        }
    )
);

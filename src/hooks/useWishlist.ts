import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    image: string;
    images?: string[];
    category: string;
}

interface WishlistStore {
    items: WishlistItem[];
    addItem: (product: any) => void;
    removeItem: (productId: string) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlist = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const { items } = get();
                const existingItem = items.find((item) => item._id === product._id);

                if (!existingItem) {
                    set({ items: [...items, product] });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item._id !== productId) });
            },
            clearWishlist: () => set({ items: [] }),
            isInWishlist: (productId) => get().items.some((item) => item._id === productId),
        }),
        {
            name: "wishlist-storage",
        }
    )
);

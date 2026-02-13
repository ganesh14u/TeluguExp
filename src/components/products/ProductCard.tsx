import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import AddToCartToast from "@/components/cart/AddToCartToast";

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        slug: string;
        price: number;
        discountPrice?: number;
        image: string;
        images?: string[];
        category: string;
        ratings: number;
        numReviews: number;
        isFeatured?: boolean;
        isSeasonal?: boolean;
        stock?: number;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const cart = useCart();
    const wishlist = useWishlist();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fallback to first image in array if main image is missing, or placeholder
    const displayImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);

    const discountPercent = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Stock Check
        const currentQty = cart.items.find(item => item._id === product._id)?.quantity || 0;
        if ((product as any).stock <= currentQty) {
            toast.error("Out of Stock", { description: "You have reached the maximum available quantity." });
            return;
        }

        cart.addItem(product, 1);
        toast.custom((t) => (
            <AddToCartToast
                toastId={t}
                productName={product.name}
                productPrice={product.discountPrice || product.price}
                productImage={displayImage as string || "https://placehold.co/100"}
            />
        ), { duration: 4000 });
    };

    const isWishlisted = mounted && wishlist.isInWishlist(product._id);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative bg-white border-2 border-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden transition-all hover:bg-slate-50/50 hover:border-primary/10 hover:shadow-2xl hover:shadow-primary/5 h-full flex flex-col"
        >
            {/* Wishlist Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isWishlisted) {
                        wishlist.removeItem(product._id);
                        toast.success("Removed from wishlist");
                    } else {
                        wishlist.addItem(product);
                        toast.success("Added to wishlist");
                    }
                }}
                className={`absolute top-4 right-4 z-10 h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${isWishlisted
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-white/80 backdrop-blur-md text-slate-400 hover:text-red-500 hover:bg-white shadow-sm"
                    }`}
            >
                <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {discountPercent > 0 && (
                    <Badge className="bg-primary text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest border-none px-3 py-1 rounded-lg md:rounded-xl shadow-lg shadow-primary/20">
                        {discountPercent}% OFF
                    </Badge>
                )}
                {product.isFeatured && (
                    <Badge className="bg-slate-950 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest border-none px-3 py-1 rounded-lg md:rounded-xl shadow-lg ring-1 ring-white/10">
                        LAB PICK
                    </Badge>
                )}
            </div>

            {/* Image Container */}
            <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-slate-50 group-hover:bg-transparent transition-colors p-4 md:p-8">
                <div className="w-full h-full relative z-1">
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                            <ShoppingBag className="h-16 w-16 md:h-24 md:w-24 opacity-20" />
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Content */}
            <div className="p-4 md:p-8 flex flex-col grow bg-white group-hover:bg-transparent transition-colors">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-primary italic">
                        {product.category}
                    </span>
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-2 w-2 md:h-2.5 md:w-2.5 ${i < Math.floor(product.ratings) ? "fill-current" : "text-slate-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-black text-sm md:text-xl uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-10 md:min-h-14">
                        {product.name}
                    </h3>
                </Link>

                {/* Pricing & Add Button */}
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter italic">
                            ₹{(product.discountPrice || product.price).toLocaleString()}
                        </span>
                        {product.discountPrice && (
                            <span className="text-[10px] md:text-xs text-slate-400 line-through font-bold">
                                ₹{product.price.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="h-10 w-10 md:h-14 md:w-14 bg-slate-950 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-primary transition-all active:scale-90 shadow-xl shadow-black/5 hover:shadow-primary/20"
                        title="Quick Add"
                    >
                        <ShoppingBag className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

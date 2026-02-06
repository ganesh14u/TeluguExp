import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

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
        toast.success(`${product.name} added to cart!`, {
            description: "Go to cart to checkout.",
            action: {
                label: "View Cart",
                onClick: () => window.location.href = "/cart"
            }
        });
    };

    const isWishlisted = mounted && wishlist.isInWishlist(product._id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-card border rounded-xl overflow-hidden transition-all h-full flex flex-col"
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
                className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors ${isWishlisted
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-white/80 backdrop-blur-md hover:text-red-500"
                    }`}
            >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {discountPercent > 0 && (
                    <Badge variant="destructive" className="font-bold">
                        {discountPercent}% OFF
                    </Badge>
                )}
                {product.isFeatured && (
                    <Badge className="bg-orange-500 hover:bg-orange-600 font-bold border-none">
                        HOT
                    </Badge>
                )}
            </div>

            {/* Image Container */}
            <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted group block">
                {displayImage ? (
                    <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <ShoppingBag className="h-12 w-12 opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col grow">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {product.category}
                </div>
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-12">
                        {product.name}
                    </h3>
                </Link>

                {/* Ratings */}
                <div className="flex items-center gap-1 mt-2">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(product.ratings) ? "fill-current" : "text-gray-300"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                        ({product.numReviews})
                    </span>
                </div>

                {/* Pricing */}
                <div className="mt-auto pt-3 flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-primary">
                            ₹{(product.discountPrice || product.price).toLocaleString()}
                        </span>
                        {product.discountPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                                ₹{product.price.toLocaleString()}
                            </span>
                        )}
                    </div>
                    <Button
                        size="icon"
                        onClick={handleAddToCart}
                        className="rounded-full group-hover:scale-110 transition-transform"
                    >
                        <ShoppingBag className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

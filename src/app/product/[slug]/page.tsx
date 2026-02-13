"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Star,
    ShoppingCart,
    Heart,
    Share2,
    Truck,
    ShieldCheck,
    RotateCcw,
    Plus,
    Minus,
    MessageCircle,
    Loader2,
    Info,
    CheckCircle2,
    Zap,
    Box,
    X
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/products/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import AddToCartToast from "@/components/cart/AddToCartToast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useWishlist } from "@/hooks/useWishlist";

export default function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const cart = useCart();
    const wishlist = useWishlist();
    const { data: session } = useSession();
    const [hasBought, setHasBought] = useState(false);

    usePageTitle(product?.name || "Product");

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;
            try {
                const res = await fetch(`/api/products/${slug}`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setProduct(data);

                // Fetch related products (same category)
                const relRes = await fetch(`/api/products?category=${data.category}`);
                const relData = await relRes.json();
                setRelatedProducts(relData.filter((p: any) => p._id !== data._id).slice(0, 4));
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        const checkPurchase = async () => {
            if (!session?.user?.id || !product?._id) return;
            try {
                const res = await fetch(`/api/orders?userId=${(session.user as any).id}`);
                const orders = await res.json();
                const bought = orders.some((order: any) =>
                    order.isPaid && order.orderItems.some((item: any) => item.productId === product._id)
                );
                setHasBought(bought);
            } catch (error) {
                console.error("Failed to check purchase", error);
            }
        };
        checkPurchase();
    }, [session, product]);

    // Auto-rotate images every 2 seconds (pause on hover)
    useEffect(() => {
        if (!product || !product.images || product.images.length <= 1 || isPaused) return;

        const timer = setInterval(() => {
            setSelectedImage((prev) => (prev + 1) % product.images.length);
        }, 2000);

        return () => clearInterval(timer);
    }, [product, isPaused]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleAddToCart = () => {
        if (!product) return;

        // Stock Check
        const currentQty = cart.items.find(item => item._id === product._id)?.quantity || 0;
        if (product.stock <= currentQty + quantity - 1) { // -1 because quantity state starts at 1
            toast.error("Out of Stock", { description: `You can only add ${Math.max(0, product.stock - currentQty)} more.` });
            return;
        }

        if (currentQty + quantity > product.stock) {
            toast.error("Insufficient Stock", { description: `Only ${product.stock} items available in total.` });
            return;
        }

        cart.addItem(product, quantity);
        toast.custom((t) => (
            <AddToCartToast
                toastId={t}
                productName={product.name}
                productPrice={product.discountPrice || product.price}
                productImage={images[0] || product.image || "https://placehold.co/100"}
            />
        ), { duration: 4000 });
    };

    const isWishlisted = mounted && product ? wishlist.isInWishlist(product._id) : false;

    const handleWishlist = () => {
        if (!product) return;
        if (isWishlisted) {
            wishlist.removeItem(product._id);
            toast.success("Removed from wishlist");
        } else {
            wishlist.addItem(product);
            toast.success("Added to wishlist!", {
                description: product.name
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-bold text-sm uppercase tracking-widest text-slate-400">Loading Product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-slate-50">
                <div className="p-8 bg-white rounded-3xl shadow-xl border flex flex-col items-center text-center">
                    <Info className="h-10 w-10 text-red-500 mb-4" />
                    <h1 className="text-2xl font-black uppercase italic mb-2">Product Not Found</h1>
                    <p className="text-muted-foreground text-sm max-w-xs mb-6">Sorry, this product is currently unavailable.</p>
                    <Link href="/shop">
                        <Button className="rounded-xl h-12 px-8 font-black uppercase tracking-widest">Go to Shop</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : ['https://placehold.co/800']);
    const discountPercent = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    return (
        <div className="min-h-screen bg-white pb-12">
            {/* Nav Bar - Reduced height */}
            <div className="bg-white/80 backdrop-blur-md sticky top-16 z-40 border-b">
                <div className="container mx-auto px-4 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                            ← Back
                        </Link>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
                    {/* Left: Images */}
                    <div className="lg:col-span-6 space-y-4">
                        <div
                            className="relative aspect-square max-w-[450px] md:max-w-[500px] mx-auto rounded-2xl md:rounded-3xl overflow-hidden bg-white border shadow-md"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-105"
                                />
                            </AnimatePresence>
                            {/* Badges */}
                            <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1.5 md:gap-2">
                                {discountPercent > 0 && (
                                    <Badge className="bg-red-500 text-white font-black text-[9px] md:text-[10px] uppercase px-3 md:px-4 py-1.5 rounded-full border-none shadow-lg">
                                        {discountPercent}% OFF
                                    </Badge>
                                )}
                                {product.isFeatured && (
                                    <Badge className="bg-orange-500 text-white font-black text-[9px] md:text-[10px] uppercase px-3 md:px-4 py-1.5 rounded-full border-none shadow-lg">
                                        ★ TOP PICK
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-2.5 md:gap-3 justify-center overflow-x-auto py-2 no-scrollbar">
                                {images.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-16 md:w-20 aspect-square rounded-lg md:rounded-xl overflow-hidden border-2 transition-all p-1 ${selectedImage === i
                                            ? "border-primary shadow-md scale-105"
                                            : "border-slate-100 opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover rounded-md md:rounded-lg" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="lg:col-span-6 flex flex-col gap-5 md:gap-6">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="bg-slate-100 text-slate-800 border-none uppercase tracking-widest font-black rounded-full px-3 md:px-4 py-1 text-[8px] md:text-[9px]">
                                    {product.category}
                                </Badge>
                                <div className="flex items-center gap-1 text-orange-500">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="font-black text-[9px] md:text-[10px] uppercase tracking-widest">{product.ratings || 4.5}</span>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic text-slate-900 line-clamp-2 md:line-clamp-none">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price Area */}
                        <div className="space-y-1">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Limited Special Price:</span>
                            <div className="flex items-end gap-3 flex-wrap">
                                <span className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                                {product.discountPrice && (
                                    <span className="text-xl md:text-2xl text-slate-400 line-through font-black italic opacity-50 mb-1">₹{product.price.toLocaleString()}</span>
                                )}
                            </div>
                            {product.stock > 0 && product.stock < 5 && (
                                <p className="text-[9px] md:text-[10px] font-black uppercase text-red-500 animate-pulse mt-3 flex items-center gap-1.5">
                                    <Box className="h-3 w-3" /> Hurry! Only {product.stock} items left.
                                </p>
                            )}
                            {product.stock === 0 && (
                                <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mt-3 flex items-center gap-1.5">
                                    <X className="h-3 w-3" /> Currently Out of Stock
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-4 md:space-y-5">
                            <div className="flex gap-4">
                                <div className="flex items-center border-2 rounded-xl md:rounded-2xl p-0.5 md:p-1 bg-slate-50 h-12 md:h-14">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-lg h-9 w-9 md:h-10 md:w-10 text-slate-500"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Minus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                    <span className="text-base md:text-lg font-black w-8 md:w-10 text-center text-slate-900 italic">{quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-lg h-9 w-9 md:h-10 md:w-10 text-slate-500"
                                        disabled={quantity >= product.stock}
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    >
                                        <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="grow rounded-xl md:rounded-2xl h-12 md:h-14 text-sm md:text-base font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 bg-slate-900 border-none hover:bg-black italic disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-95"
                                >
                                    {product.stock === 0 ? "Out of Stock" : (
                                        <>
                                            <ShoppingCart className="h-4 w-4 text-primary" /> Add to Cart
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={handleWishlist} variant="outline" className={`h-11 md:h-12 rounded-xl md:rounded-2xl font-black uppercase tracking-widest border-2 text-[9px] md:text-[10px] gap-2 transition-colors ${isWishlisted ? 'bg-red-50 border-red-100 text-red-600' : 'hover:border-red-100 hover:text-red-500'}`}>
                                    <Heart className={`h-3.5 w-3.5 transition-all ${isWishlisted ? 'fill-red-600' : ''}`} /> {isWishlisted ? 'Saved' : 'Wishlist'}
                                </Button>
                                <Link href={`https://wa.me/918142504687?text=I'm interested in Buying ${product.name}`} className="block w-full">
                                    <Button variant="outline" className="h-11 md:h-12 w-full rounded-xl md:rounded-2xl font-black uppercase tracking-widest border-2 border-green-50/50 bg-green-50/20 text-green-600 hover:bg-green-600 hover:text-white transition-all text-[9px] md:text-[10px] gap-2 p-0">
                                        <MessageCircle className="h-3.5 w-3.5" /> Buy on WhatsApp
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Trust Badges - Improved spacing and size */}
                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-dashed">
                            {[
                                { icon: Truck, title: "Shipping", sub: "3-5 Business Days", color: "text-blue-600" },
                                { icon: ShieldCheck, title: "Authentic", sub: "100% Genuine", color: "text-green-600" },
                                { icon: RotateCcw, title: "Returns", sub: "7-Day Easy Return", color: "text-orange-600" },
                                { icon: Zap, title: "24/7 Support", sub: "Fast Response", color: "text-primary" }
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 md:p-4 rounded-xl md:rounded-2xl border bg-slate-50/50 border-slate-100/50">
                                    <feature.icon className={`h-4 w-4 md:h-5 md:w-5 ${feature.color} mb-1`} />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-800 italic">{feature.title}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{feature.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs Area */}
                <div className="mt-12 md:mt-16 max-w-4xl mx-auto">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="w-full justify-start bg-slate-50/80 border p-1 h-11 md:h-12 rounded-xl md:rounded-2xl gap-2 mb-6 md:mb-8">
                            <TabsTrigger value="description" className="px-6 md:px-10 rounded-lg md:rounded-xl h-full font-black uppercase tracking-widest text-[9px] md:text-[10px] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Description</TabsTrigger>
                            <TabsTrigger value="reviews" className="px-6 md:px-10 rounded-lg md:rounded-xl h-full font-black uppercase tracking-widest text-[9px] md:text-[10px] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Reviews</TabsTrigger>
                        </TabsList>

                        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border-2 border-slate-50 shadow-sm min-h-[300px]">
                            <TabsContent value="description" className="mt-0 focus-visible:outline-none">
                                <div className="space-y-6 md:space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                                            <div className="h-6 w-1.5 bg-primary rounded-full" />
                                            Deep Dive
                                        </h3>
                                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base">{product.description}</p>
                                    </div>

                                    {product.videoUrl && (
                                        <div className="pt-6 border-t border-dashed">
                                            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3 mb-6">
                                                <div className="h-6 w-1.5 bg-primary rounded-full" />
                                                Video Showcase
                                            </h3>
                                            <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden border-2 border-slate-100 shadow-2xl bg-slate-100">
                                                {(() => {
                                                    const getYouTubeID = (url: string) => {
                                                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                                        const match = url.match(regExp);
                                                        return (match && match[2].length === 11) ? match[2] : null;
                                                    };
                                                    const videoId = getYouTubeID(product.videoUrl);
                                                    if (videoId) {
                                                        return (
                                                            <iframe
                                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                                title="Product Video"
                                                                className="absolute inset-0 w-full h-full"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />
                                                        );
                                                    }
                                                    return <p className="p-8 text-center text-slate-400 font-bold uppercase text-[10px]">Video Format Error</p>;
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-0 focus-visible:outline-none">
                                <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <Star className="h-6 w-6 text-slate-200" />
                                    </div>
                                    <h4 className="text-xl font-black uppercase italic tracking-tight text-slate-900 mb-2">No Reviews Yet</h4>
                                    <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest max-w-xs mb-8">Be the first to share your experience with this kit!</p>

                                    {hasBought ? (
                                        <Button className="rounded-xl h-12 px-10 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/10 transition-transform active:scale-95">
                                            Write Review
                                        </Button>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl max-w-xs">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                                                Verified purchase required to submit reviews.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Similar Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 md:mt-24">
                        <div className="flex items-end justify-between mb-8 md:mb-12 border-b-2 border-slate-50 pb-5 md:pb-6">
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-slate-900">
                                You Might <span className="text-primary NOT-italic">Also Like</span>
                            </h2>
                            <Link href="/shop" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:text-black transition-all mb-1 shrink-0">
                                View Collection →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 md:p-5 bg-white/95 backdrop-blur-2xl border-t border-slate-100 flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-3xl">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none mb-1.5">Special Price</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter italic">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                </div>
                <Button onClick={handleAddToCart} disabled={product.stock === 0} className="rounded-xl px-10 h-13 font-black uppercase text-xs tracking-widest bg-slate-900 shadow-xl shadow-slate-200">
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
            </div>
        </div>
    );
}

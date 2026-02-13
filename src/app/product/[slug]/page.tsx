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

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left: Images - Better Scale */}
                    <div className="lg:col-span-6 space-y-4">
                        <div
                            className="relative aspect-square max-w-[500px] mx-auto rounded-3xl overflow-hidden bg-white border shadow-md"
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
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {discountPercent > 0 && (
                                    <Badge className="bg-red-500 text-white font-black text-[10px] uppercase px-4 py-1.5 rounded-full border-none shadow-lg">
                                        {discountPercent}% OFF
                                    </Badge>
                                )}
                                {product.isFeatured && (
                                    <Badge className="bg-orange-500 text-white font-black text-[10px] uppercase px-4 py-1.5 rounded-full border-none shadow-lg">
                                        ★ TOP PICK
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 justify-center overflow-x-auto py-2 no-scrollbar">
                                {images.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all p-1 ${selectedImage === i
                                            ? "border-primary shadow-md scale-105"
                                            : "border-slate-100 opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info - Tightened Space */}
                    <div className="lg:col-span-6 flex flex-col gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-slate-100 text-slate-900 border-none uppercase tracking-widest font-black rounded-full px-4 py-1 text-[9px]">
                                    {product.category}
                                </Badge>
                                <div className="flex items-center gap-1 text-orange-500">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="font-black text-[10px] uppercase tracking-widest">{product.ratings || 4.5}</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic text-slate-900">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price Area */}
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Special Price:</span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-black text-slate-900 tracking-tighter italic">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                                {product.discountPrice && (
                                    <span className="text-xl text-slate-300 line-through font-bold">₹{product.price.toLocaleString()}</span>
                                )}
                            </div>
                            {product.stock > 0 && product.stock < 5 && (
                                <p className="text-[10px] font-black uppercase text-red-500 animate-pulse mt-2 flex items-center gap-1">
                                    <Box className="h-3 w-3" /> Only {product.stock} items left in stock!
                                </p>
                            )}
                            {product.stock === 0 && (
                                <p className="text-[10px] font-black uppercase text-red-600 mt-2 flex items-center gap-1">
                                    <X className="h-3 w-3" /> Out of Stock
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex items-center border rounded-xl p-1 bg-slate-50 h-14">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-lg h-10 w-10 text-slate-400"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-lg font-black w-10 text-center text-slate-900">{quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-lg h-10 w-10 text-slate-400"
                                        disabled={quantity >= product.stock}
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="grow rounded-xl h-14 text-base font-black uppercase tracking-tight gap-2 shadow-lg shadow-primary/20 bg-slate-900 hover:bg-slate-800 italic disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                                >
                                    {product.stock === 0 ? "Out of Stock" : (
                                        <>
                                            <ShoppingCart className={`h-4 w-4 ${product.stock === 0 ? "text-slate-400" : "text-primary"}`} /> Add to Cart
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={handleWishlist} variant="outline" className={`h-12 rounded-xl font-black uppercase tracking-widest border-2 text-[10px] gap-2 ${isWishlisted ? 'bg-red-50 border-red-200 text-red-600' : ''}`}>
                                    <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-red-600' : ''}`} /> {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                </Button>
                                <Link href={`https://wa.me/918142504687?text=I'm interested in Buying ${product.name}`} className="block w-full">
                                    <Button variant="outline" className="h-12 w-full rounded-xl font-black uppercase tracking-widest border-2 border-green-100 bg-green-50/50 text-green-600 hover:bg-green-600 hover:text-white transition-all text-[10px] gap-2">
                                        <MessageCircle className="h-3.5 w-3.5" /> Buy on WhatsApp
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Trust Badges - Tight Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-dashed">
                            {[
                                { icon: Truck, title: "Shipping", sub: "3-5 Days", color: "text-blue-500", bg: "bg-blue-50" },
                                { icon: ShieldCheck, title: "Original", sub: "100% Authentic", color: "text-green-500", bg: "bg-green-50" },
                                { icon: RotateCcw, title: "Returns", sub: "7-Day Easy", color: "text-orange-500", bg: "bg-orange-50" },
                                { icon: Zap, title: "Support", sub: "Fast Help", color: "text-primary", bg: "bg-primary/5" }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className={`w-8 h-8 ${feature.bg} ${feature.color} rounded-lg flex items-center justify-center shrink-0`}>
                                        <feature.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-800">{feature.title}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{feature.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs - Reduced Margin */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="w-full justify-start bg-slate-50 border h-12 rounded-xl p-1 gap-2 mb-8">
                            {[
                                { id: "description", label: "Description" },
                                { id: "reviews", label: "Reviews" }
                            ].map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="px-6 rounded-lg h-full font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100">
                            <TabsContent value="description" className="mt-0 focus-visible:outline-none">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                                        <div className="h-6 w-1 bg-primary rounded-full" />
                                        About this product
                                    </h3>
                                    <p className="text-slate-500 font-medium leading-relaxed whitespace-pre-wrap text-sm">{product.description}</p>

                                    {product.videoUrl && (
                                        <div className="mt-8 space-y-4">
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                                                <div className="h-6 w-1 bg-primary rounded-full" />
                                                Product Showcase
                                            </h3>
                                            <div className="relative aspect-video rounded-2xl overflow-hidden border shadow-inner bg-slate-100">
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
                                                                title="YouTube video player"
                                                                className="absolute inset-0 w-full h-full"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />
                                                        );
                                                    }
                                                    return <p className="p-8 text-center text-slate-400 font-bold uppercase text-[10px]">Invalid Video Link</p>;
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>


                            <TabsContent value="reviews" className="mt-0 focus-visible:outline-none">
                                <div className="text-center py-10 px-4 bg-white border-2 border-dashed rounded-2xl">
                                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                        {product.reviews?.length > 0 ? "What our customers are saying" : "No reviews yet."}
                                    </p>

                                    {hasBought ? (
                                        <Button variant="outline" className="mt-4 rounded-lg h-10 px-6 font-black text-[9px] uppercase tracking-widest">
                                            Write a Review
                                        </Button>
                                    ) : (
                                        <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                            Only verified buyers can write a review.
                                        </p>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Similar Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <div className="flex items-end justify-between mb-8 border-b pb-4">
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">
                                Similar <span className="text-primary NOT-italic">Products</span>
                            </h2>
                            <Link href="/shop" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
                                View All Category
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Bar - Simplified */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-xl border-t flex items-center justify-between shadow-2xl">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                    <span className="text-xl font-black text-primary">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                </div>
                <Button onClick={handleAddToCart} className="rounded-xl px-10 h-12 font-black uppercase text-xs bg-slate-900">Add to Cart</Button>
            </div>
        </div>
    );
}

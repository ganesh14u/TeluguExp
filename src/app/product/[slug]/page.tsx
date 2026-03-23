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
    X,
    Package
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
import { useCurrency } from "@/context/CurrencyContext";
import { formatDistanceToNow } from "date-fns";

export default function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Review states
    const [reviewMode, setReviewMode] = useState(false);
    const [submitRating, setSubmitRating] = useState(5);
    const [submitComment, setSubmitComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const cart = useCart();
    const wishlist = useWishlist();
    const { formatPrice } = useCurrency();
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

    const currentQty = mounted && product ? cart.items.find((item: any) => item._id === product._id)?.quantity || 0 : 0;

    const handleAddToCart = () => {
        if (!product) return;

        if (product.stock <= currentQty) { 
            toast.error("Out of Stock", { description: `You have reached the maximum available quantity.` });
            return;
        }

        setIsAnimating(true);
        setTimeout(() => {
            cart.addItem(product, 1);
            setIsAnimating(false);
            toast.custom((t) => (
                <AddToCartToast
                    toastId={t}
                    productName={product.name}
                    productPrice={product.discountPrice || product.price}
                    productImage={images[0] || product.image || "https://placehold.co/100"}
                />
            ), { duration: 4000 });
        }, 1500);
    };

    const handleIncrement = () => {
        if (!product) return;
        if (product.stock <= currentQty) {
            toast.error("Out of Stock", { description: "You have reached the maximum available stock." });
            return;
        }
        cart.addItem(product, 1);
    };

    const handleDecrement = () => {
        if (!product) return;
        if (currentQty > 1) {
            cart.updateQuantity(product._id, currentQty - 1);
        } else {
            cart.removeItem(product._id);
        }
    };

    const handleReviewSubmit = async () => {
        if (!product) return;
        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/products/${product.slug}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: submitRating, comment: submitComment }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Review submitted! It will appear once approved by an admin.");
            setReviewMode(false);
            setSubmitComment("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmittingReview(false);
        }
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
                <p className="font-bold text-sm capitalize tracking-widest text-slate-400">Loading Product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-slate-50">
                <div className="p-8 bg-white rounded-3xl shadow-xl border flex flex-col items-center text-center">
                    <Info className="h-10 w-10 text-red-500 mb-4" />
                    <h1 className="text-base font-black capitalize italic mb-2">Product Not Found</h1>
                    <p className="text-muted-foreground text-sm max-w-xs mb-6">Sorry, this product is currently unavailable.</p>
                    <Link href="/shop">
                        <Button className="rounded-xl h-12 px-8 font-black capitalize tracking-widest">Go to Shop</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : ['https://placehold.co/800']);
    const discountPercent = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    return (
        <div className="min-h-screen bg-white pb-12">
            <style dangerouslySetInnerHTML={{ __html: `
            .custom-cart-button {
                position: relative;
                width: 100%;
                height: 48px;
                border: 0;
                border-radius: 12px;
                background-color: #4834d4;
                outline: none;
                cursor: pointer;
                color: #fff;
                transition: .3s ease-in-out;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .custom-cart-button:hover:not(:disabled) { background-color: #35269b; }
            .custom-cart-button:active:not(:disabled) { transform: scale(.95); }
            
            .custom-cart-button .cart-icon {
                position: absolute;
                z-index: 2;
                top: 50%;
                left: -10%;
                transform: translate(-50%,-50%);
            }
            .custom-cart-button .box-icon {
                position: absolute;
                z-index: 3;
                top: -20%;
                left: 52%;
                transform: translate(-50%,-50%);
            }
            .custom-cart-button span {
                position: absolute;
                z-index: 3;
                left: 50%;
                top: 50%;
                color: #fff;
                font-weight: 600;
                font-size: 16px;
                transform: translate(-50%,-50%);
                white-space: nowrap;
            }
            .custom-cart-button span.add-to-cart { opacity: 1; }
            .custom-cart-button span.added { opacity: 0; }
            
            .custom-cart-button.clicked .cart-icon { animation: cart-anim-btn 1.5s ease-in-out forwards; }
            .custom-cart-button.clicked .box-icon { animation: box-anim-btn 1.5s ease-in-out forwards; }
            .custom-cart-button.clicked span.add-to-cart { animation: txt1-anim-btn 1.5s ease-in-out forwards; }
            .custom-cart-button.clicked span.added { animation: txt2-anim-btn 1.5s ease-in-out forwards; }
            `}} />

            {/* Nav Bar - Reduced height */}
            <div className="bg-white/80 backdrop-blur-md sticky top-16 z-40 border-b">
                <div className="container mx-auto px-4 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/shop" className="text-[10px] font-black capitalize tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                            ← Back
                        </Link>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-[10px] font-bold text-slate-400 capitalize tracking-widest truncate max-w-[150px]">{product.name}</span>
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
                                    <Badge className="bg-red-500 text-white font-black text-[9px] md:text-[10px] capitalize px-3 md:px-4 py-1.5 rounded-full border-none shadow-lg">
                                        {discountPercent}% OFF
                                    </Badge>
                                )}
                                {product.isFeatured && (
                                    <Badge className="bg-orange-500 text-white font-black text-[9px] md:text-[10px] capitalize px-3 md:px-4 py-1.5 rounded-full border-none shadow-lg">
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
                                <Badge className="bg-slate-100 text-slate-800 border-none capitalize tracking-widest font-black rounded-full px-3 md:px-4 py-1 text-[8px] md:text-[9px]">
                                    {product.category}
                                </Badge>
                                <div className="flex items-center gap-1 text-orange-500">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="font-black text-[9px] md:text-[10px] capitalize tracking-widest">{product.ratings || 4.5}</span>
                                </div>
                            </div>
                            <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter capitalize italic text-slate-900 line-clamp-2 md:line-clamp-none">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price Area */}
                        <div className="space-y-1">
                            <span className="text-[9px] md:text-[10px] font-black capitalize tracking-widest text-slate-400 italic">Limited Special Price:</span>
                            <div className="flex items-end gap-3 flex-wrap">
                                <span className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter italic">{formatPrice(product.discountPrice || product.price)}</span>
                                {product.discountPrice && (
                                    <span className="text-sm md:text-base text-slate-400 line-through font-black italic opacity-50 mb-1">{formatPrice(product.price)}</span>
                                )}
                            </div>
                            {product.stock > 0 && product.stock < 5 && (
                                <p className="text-[9px] md:text-[10px] font-black capitalize text-red-500 animate-pulse mt-3 flex items-center gap-1.5">
                                    <Box className="h-3 w-3" /> Hurry! Only {product.stock} items left.
                                </p>
                            )}
                            {product.stock === 0 && (
                                <p className="text-[9px] md:text-[10px] font-black capitalize text-slate-400 mt-3 flex items-center gap-1.5">
                                    <X className="h-3 w-3" /> Currently Out of Stock
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-4 md:space-y-5">
                            <div className="flex gap-3 md:gap-4 w-full">
                                <div className="grow">
                                    {currentQty > 0 && !isAnimating ? (
                                        <div className="flex items-center justify-between border-2 border-primary bg-primary/5 rounded-2xl h-12 md:h-14 w-full px-6 text-primary">
                                            <button onClick={handleDecrement} className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg hover:bg-primary/20 transition-colors">
                                                <Minus className="h-4 w-4 md:h-5 md:w-5" />
                                            </button>
                                            <span className="font-black text-lg md:text-xl tracking-widest leading-none">{currentQty}</span>
                                            <button onClick={handleIncrement} className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg hover:bg-primary/20 transition-colors">
                                                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={product.stock === 0 || isAnimating}
                                            className={`custom-cart-button h-12! md:h-14! rounded-2xl! text-sm! md:text-base! shadow-xl shadow-black/5 ${isAnimating ? "clicked" : ""} ${product.stock === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                                            title={product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                        >
                                            <ShoppingCart className="cart-icon h-5 w-5 md:h-6 md:w-6 stroke-2" />
                                            <Package className="box-icon h-4 w-4 md:h-5 md:w-5 stroke-2" />
                                            <span className="add-to-cart">{product.stock === 0 ? "Out of Stock" : "Add to cart"}</span>
                                            <span className="added">Added</span>
                                        </button>
                                    )}
                                </div>
                                <Button 
                                    onClick={handleWishlist} 
                                    variant="outline" 
                                    className={`shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-2xl border-2 transition-colors flex items-center justify-center p-0 ${isWishlisted ? 'bg-red-50 border-red-100 text-red-600' : 'hover:border-red-100 hover:text-red-500'}`}
                                    title={isWishlisted ? 'Saved' : 'Wishlist'}
                                >
                                    <Heart className={`h-5 w-5 md:h-6 md:w-6 transition-all ${isWishlisted ? 'fill-red-600' : ''}`} />
                                </Button>
                            </div>
                            
                            <Link href={`https://wa.me/918142504687?text=${encodeURIComponent(`Hi I am ${session?.user?.name || 'Guest'} and I need Help In Telugu Adventures Website. (Regarding: ${product.name})`)}`} className="block w-full">
                                <Button className="h-12 md:h-14 w-full rounded-2xl font-black capitalize tracking-widest bg-[#25D366] text-white hover:bg-[#128C7E] shadow-lg shadow-[#25D366]/20 transition-all text-[10px] md:text-sm gap-2 border-none">
                                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5" /> Buy on WhatsApp
                                </Button>
                            </Link>
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
                                    <span className="text-[9px] md:text-[10px] font-black capitalize tracking-widest text-slate-800 italic">{feature.title}</span>
                                    <span className="text-[8px] font-bold text-slate-400 capitalize tracking-tight">{feature.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs Area */}
                <div className="mt-12 md:mt-16 max-w-4xl mx-auto">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="w-full justify-start bg-slate-50/80 border p-1 h-11 md:h-12 rounded-xl md:rounded-2xl gap-2 mb-6 md:mb-8">
                            <TabsTrigger value="description" className="px-6 md:px-10 rounded-lg md:rounded-xl h-full font-black capitalize tracking-widest text-[9px] md:text-[10px] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Description</TabsTrigger>
                            <TabsTrigger value="reviews" className="px-6 md:px-10 rounded-lg md:rounded-xl h-full font-black capitalize tracking-widest text-[9px] md:text-[10px] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Reviews</TabsTrigger>
                        </TabsList>

                        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border-2 border-slate-50 shadow-sm min-h-[300px]">
                            <TabsContent value="description" className="mt-0 focus-visible:outline-none">
                                <div className="space-y-6 md:space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm md:text-base font-black capitalize italic tracking-tighter text-slate-900 flex items-center gap-3">
                                            <div className="h-6 w-1.5 bg-primary rounded-full" />
                                            Deep Dive
                                        </h3>
                                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base">{product.description}</p>
                                    </div>

                                    {product.videoUrl && (
                                        <div className="pt-6 border-t border-dashed">
                                            <h3 className="text-sm md:text-base font-black capitalize italic tracking-tighter text-slate-900 flex items-center gap-3 mb-6">
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
                                                    return <p className="p-8 text-center text-slate-400 font-bold capitalize text-[10px]">Video Format Error</p>;
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-0 focus-visible:outline-none">
                                <div className="mb-8 flex items-center justify-between border-b-2 border-slate-50 pb-6">
                                    <h3 className="text-sm md:text-base font-black capitalize italic tracking-tighter text-slate-900 flex items-center gap-3">
                                        <div className="h-6 w-1.5 bg-yellow-400 rounded-full" />
                                        Customer Feedback
                                    </h3>
                                    {hasBought && !reviewMode && (
                                        <Button onClick={() => setReviewMode(true)} className="rounded-xl h-10 px-6 font-black text-[10px] md:text-xs capitalize tracking-widest shadow-lg shadow-primary/10 transition-transform active:scale-95">
                                            Write Review
                                        </Button>
                                    )}
                                </div>

                                {reviewMode && (
                                    <div className="mb-10 p-6 md:p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl relative">
                                        <button onClick={() => setReviewMode(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black transition-colors">
                                            <X className="h-5 w-5" />
                                        </button>
                                        <h4 className="font-black italic text-sm md:text-base mb-4">Rate Your Experience</h4>
                                        <div className="flex gap-1 mb-6">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <Star key={v} onClick={() => setSubmitRating(v)} className={`h-8 w-8 cursor-pointer transition-all hover:scale-110 active:scale-90 ${v <= submitRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                                            ))}
                                        </div>
                                        <textarea
                                            value={submitComment}
                                            onChange={(e) => setSubmitComment(e.target.value)}
                                            placeholder="What did you love about this? What could be better?"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm md:text-base outline-none focus:border-primary/50 transition-colors min-h-[120px] mb-4"
                                        />
                                        <Button onClick={handleReviewSubmit} disabled={submittingReview || !submitComment.trim()} className="rounded-xl h-12 px-10 font-black text-xs capitalize tracking-widest shadow-lg shadow-primary/20 w-full md:w-auto transition-transform active:scale-95">
                                            {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
                                        </Button>
                                    </div>
                                )}

                                {(!product?.reviews || product.reviews.filter((r: any) => r.isApproved).length === 0) ? (
                                    !reviewMode && (
                                        <div className="flex flex-col items-center justify-center text-center py-10 px-6">
                                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                                <Star className="h-6 w-6 text-slate-200" />
                                            </div>
                                            <h4 className="text-xl font-black capitalize italic tracking-tight text-slate-900 mb-2">No Reviews Yet</h4>
                                            <p className="text-slate-400 font-bold capitalize text-[9px] md:text-[10px] tracking-widest max-w-xs mb-8">Be the first to share your experience!</p>
                                            {!hasBought && (
                                                <div className="p-4 bg-slate-50 rounded-xl max-w-xs">
                                                    <p className="text-[9px] font-black text-slate-400 capitalize tracking-widest leading-loose">
                                                        Verified purchase required to submit reviews.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-6">
                                        {product.reviews.filter((r: any) => r.isApproved).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((r: any) => (
                                            <div key={r._id} className="flex flex-col gap-3 pb-6 border-b-2 border-slate-50 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-black text-sm md:text-base italic text-slate-900 line-clamp-1">{product.name}</span>
                                                    <span className="text-[9px] md:text-[10px] text-slate-400 font-bold tracking-widest capitalize">
                                                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
                                                    ))}
                                                </div>
                                                <p className="italic text-slate-600 text-sm md:text-base font-medium leading-relaxed">"{r.comment}"</p>
                                                <span className="font-black text-[10px] md:text-xs mt-1 text-slate-900 capitalize tracking-widest">— {r.userName}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Similar Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 md:mt-24">
                        <div className="flex items-end justify-between mb-8 md:mb-12 border-b-2 border-slate-50 pb-5 md:pb-6">
                            <h2 className="text-base md:text-lg font-black capitalize tracking-tighter italic text-slate-900">
                                You Might <span className="text-primary NOT-italic">Also Like</span>
                            </h2>
                            <Link href="/shop" className="text-[9px] md:text-[10px] font-black capitalize tracking-widest text-primary hover:text-black transition-all mb-1 shrink-0">
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
                    <span className="text-[9px] font-black text-slate-400 capitalize tracking-widest italic leading-none mb-1.5">Special Price</span>
                    <span className="text-base font-black text-slate-900 tracking-tighter italic">{formatPrice(product.discountPrice || product.price)}</span>
                </div>
                <div className="w-1/2 md:w-1/3">
                    {currentQty > 0 && !isAnimating ? (
                        <div className="flex items-center justify-between border-2 border-primary bg-primary/5 rounded-xl h-[48px] w-full px-4 text-primary">
                            <button onClick={handleDecrement} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/20 transition-colors">
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-black text-base">{currentQty}</span>
                            <button onClick={handleIncrement} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/20 transition-colors">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || isAnimating}
                            className={`custom-cart-button shadow-xl shadow-slate-200 ${isAnimating ? "clicked" : ""} ${product.stock === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                            style={{ height: '48px', borderRadius: '12px' }}
                        >
                            <ShoppingCart className="cart-icon h-5 w-5 stroke-2" />
                            <Package className="box-icon h-4 w-4 stroke-2" />
                            <span className="add-to-cart" style={{ fontSize: '13px' }}>{product.stock === 0 ? "Out of Stock" : "Add to cart"}</span>
                            <span className="added" style={{ fontSize: '13px' }}>Added</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

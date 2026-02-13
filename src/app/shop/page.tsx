"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Rocket, Sparkles, Zap, Loader2 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ShopPage() {
    usePageTitle("Shop");
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, cRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/categories")
                ]);
                const pData = await pRes.json();
                const cData = await cRes.json();
                setProducts(pData);
                if (!cData.error) setCategories(cData);
            } catch (error) {
                console.error("Failed to fetch shop data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const shopCategories = ["all", ...categories.map(c => c.slug)];

    const filteredProducts = selectedCategory === "all"
        ? products
        : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-10">
                <div className="space-y-2 md:space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                        <Rocket className="h-3 w-3" /> Best Choice
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight md:leading-none italic uppercase">
                        Our <span className="text-primary NOT-italic">Products</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-lg font-bold md:font-medium max-w-xl uppercase tracking-tight md:normal-case">
                        Explore the frontier of science with our kits.
                    </p>
                </div>

                <div className="flex gap-2 md:gap-4 w-full md:w-auto">
                    <div className="relative grow md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search products..." className="h-11 md:h-12 pl-10 rounded-xl border-2 transition-all font-bold" />
                    </div>
                    <Button size="icon" variant="outline" className="h-11 md:h-12 w-11 md:w-12 rounded-xl border-2 shrink-0">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                {/* Sidebar Filters */}
                <div className="lg:col-span-1 space-y-4 md:space-y-8 sticky top-20 md:top-24 h-fit z-10 bg-background/80 backdrop-blur-sm lg:bg-transparent -mx-4 px-4 py-2 lg:m-0 lg:p-0">
                    <div>
                        <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest mb-3 md:mb-6 flex items-center gap-2">
                            <Sparkles className="h-3 md:h-4 w-3 md:w-4 text-primary" /> Categories
                        </h3>
                        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 no-scrollbar items-center lg:items-start">
                            {shopCategories.map((catSlug) => (
                                <button
                                    key={catSlug}
                                    onClick={() => setSelectedCategory(catSlug)}
                                    className={`shrink-0 lg:w-full text-left px-4 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl capitalize font-black transition-all text-[10px] md:text-base whitespace-nowrap active:scale-95 ${selectedCategory === catSlug
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-muted/50 lg:bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground border lg:border-none"
                                        }`}
                                >
                                    {catSlug === "all" ? "All Products" : (categories.find(c => c.slug === catSlug)?.name || catSlug)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:block p-8 rounded-3xl bg-linear-to-br from-primary to-secondary text-white relative overflow-hidden group shadow-2xl shadow-primary/10">
                        <Zap className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="text-xl font-black mb-2 relative italic uppercase tracking-tighter">Special Offer</h4>
                        <p className="text-white/80 text-sm font-bold mb-4 relative">Get 20% off on your first order. Use code: <span className="text-white">WELCOME20</span></p>
                        <Button variant="secondary" className="w-full rounded-xl h-12 font-black relative uppercase tracking-widest text-[10px]">Get Coupon</Button>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="h-64 md:h-96 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 md:h-10 w-8 md:w-10 animate-spin text-primary" />
                            <p className="font-black text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest">Loading Products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="h-64 md:h-96 flex flex-col items-center justify-center text-center">
                            <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Search className="h-6 md:h-8 w-6 md:w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">No Products Found</h3>
                            <p className="text-muted-foreground text-[10px] md:text-sm font-black uppercase tracking-widest mt-2">Try changing your filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

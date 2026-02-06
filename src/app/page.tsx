"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Truck, RefreshCcw, Loader2, FlaskConical, Cpu, Puzzle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_BANNERS, FEATURED_CATEGORIES } from "@/lib/sampleData";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Home() {
  usePageTitle("Home");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cmsContent, setCmsContent] = useState<any>(null);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const res = await fetch("/api/cms?key=homepage");
        const data = await res.json();
        if (data && data.content) setCmsContent(data.content);
      } catch (e) { }
    };
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (!data.error) setCategories(data);
      } catch (e) { }
    };
    fetchCms();
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        // Take only first 4 for best sellers
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[5s] scale-105 group-hover:scale-100"
              style={{ backgroundImage: `url(${HERO_BANNERS[currentBanner].image})` }}
            >
              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black/60" />
            </div>
            <div className="relative container mx-auto px-4 h-full flex flex-col justify-center text-white">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-primary/80 backdrop-blur-md px-3 py-1 md:px-4 md:py-1 rounded-full mb-4 md:mb-6 border border-white/10 w-fit"
              >
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-white fill-white" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">New Product Available</span>
              </motion.div>
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-8xl font-black max-w-4xl mb-4 md:mb-6 tracking-tight leading-none italic uppercase pr-4 md:pr-10"
              >
                {cmsContent?.heroTitle || HERO_BANNERS[currentBanner].title}
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm sm:text-lg md:text-2xl max-w-xl mb-6 md:mb-10 text-gray-200 font-medium leading-relaxed"
              >
                {cmsContent?.heroSubtitle || HERO_BANNERS[currentBanner].description}
              </motion.p>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
              >
                <Link href={HERO_BANNERS[currentBanner].link} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 md:h-16 rounded-2xl px-8 md:px-10 gap-3 text-base md:text-lg font-black hover:scale-105 transition-transform">
                    {HERO_BANNERS[currentBanner].buttonText} <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/shop" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 md:h-16 rounded-2xl px-8 md:px-10 bg-white/5 backdrop-blur-md border-white/20 text-white font-black hover:bg-white/10 transition-all text-base md:text-lg">
                    Browse All
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Banner Nav Dots */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {HERO_BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${currentBanner === i ? "w-8 md:w-12 bg-primary" : "w-1.5 md:w-2 bg-white/40"}`}
            />
          ))}
        </div>
      </section>

      {/* Stats/Trust Badges */}
      <section className="container mx-auto px-4 -mt-10 md:-mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6 bg-card/80 backdrop-blur-2xl rounded-3xl border-2 border-white/10 shadow-lg">
          <div className="flex flex-col items-center text-center gap-2 md:gap-3 p-2 md:p-4 hover:bg-muted/50 rounded-2xl md:rounded-3xl transition-colors group">
            <div className="p-3 md:p-4 bg-primary/10 rounded-xl md:rounded-2xl group-hover:bg-primary/20 transition-colors">
              <Truck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <span className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-tight">Pan India Shipping</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3 p-2 md:p-4 hover:bg-muted/50 rounded-2xl md:rounded-3xl transition-colors group">
            <div className="p-3 md:p-4 bg-blue-500/10 rounded-xl md:rounded-2xl group-hover:bg-blue-500/20 transition-colors">
              <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            </div>
            <span className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-tight">Verified Quality</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3 p-2 md:p-4 hover:bg-muted/50 rounded-2xl md:rounded-3xl transition-colors group">
            <div className="p-3 md:p-4 bg-orange-500/10 rounded-xl md:rounded-2xl group-hover:bg-orange-500/20 transition-colors">
              <RefreshCcw className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
            </div>
            <span className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-tight">Easy Returns</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3 p-2 md:p-4 hover:bg-muted/50 rounded-2xl md:rounded-3xl transition-colors group">
            <div className="p-3 md:p-4 bg-green-500/10 rounded-xl md:rounded-2xl group-hover:bg-green-500/20 transition-colors">
              <Zap className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
            </div>
            <span className="font-black uppercase text-[10px] md:text-xs tracking-widest leading-tight">Active Support</span>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          <div className="space-y-1">
            <div className="h-0.5 w-12 bg-primary mb-2" />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none italic pr-4">Shop by <span className="text-primary NOT-italic">Category</span></h2>
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Find the best products</p>
          </div>
          <Link href="/shop" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
            View All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {(categories.length > 0 ? categories : [
            { name: "Experiments", slug: "experiments" },
            { name: "Gadgets", slug: "gadgets" },
            { name: "Educational", slug: "toys" },
            { name: "Seasonal", slug: "seasonal" }
          ]).slice(0, 4).map((cat) => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`}>
              <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-muted/30 border-2 border-transparent hover:border-primary/20 p-4 md:p-8 text-center transition-all hover:bg-background">
                <div className="mb-4 md:mb-6 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 flex justify-center text-primary">
                  {cat.slug === 'experiments' && <FlaskConical className="h-10 w-10 md:h-16 md:w-16" />}
                  {cat.slug === 'gadgets' && <Cpu className="h-10 w-10 md:h-16 md:w-16" />}
                  {cat.slug === 'toys' && <Puzzle className="h-10 w-10 md:h-16 md:w-16" />}
                  {cat.slug === 'seasonal' && <Gift className="h-10 w-10 md:h-16 md:w-16" />}
                  {!['experiments', 'gadgets', 'toys', 'seasonal'].includes(cat.slug) && <ShoppingBag className="h-10 w-10 md:h-16 md:w-16" />}
                </div>
                <h3 className="font-black text-sm md:text-lg uppercase tracking-tight line-clamp-1">{cat.name}</h3>
                <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 md:mt-2">View More →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Zap className="h-3 w-3 fill-red-500" /> Hot This Week
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none italic pr-4">Best <span className="text-primary NOT-italic">Sellers</span></h2>
          </div>
          <Link href="/shop" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
            View More <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">Loading Products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Seasonal Promo */}
      {(!cmsContent || cmsContent.showPromoBanner) && (
        <section className="container mx-auto px-4 py-8">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-fit md:min-h-[350px] flex items-center p-8 md:p-12 border border-white/10">
            <div className="relative z-20 w-full max-w-2xl space-y-6">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                Limited Time Offer
              </div>
              <h2 className="text-white text-5xl md:text-7xl font-black leading-none tracking-tight italic uppercase pr-10">
                {cmsContent?.seasonalSaleText || "Big Sale Is Live"}
              </h2>
              <p className="text-gray-400 font-bold text-sm max-w-sm">Shop our exclusive collection with massive discounts. Hurry up, stocks are running low!</p>
              <div className="flex flex-wrap gap-6 items-center">
                <Button size="lg" className="h-14 rounded-2xl px-12 font-black text-lg uppercase italic group">
                  Explore Sale <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="flex flex-col">
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Ending In</span>
                  <span className="text-primary text-2xl font-black tabular-nums tracking-tighter">12 : 45 : 33</span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 h-full w-full pointer-events-none opacity-40 md:opacity-100">
              <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=800"
                className="absolute right-0 top-0 w-2/3 h-full object-cover grayscale opacity-30"
                alt=""
              />
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 h-fit md:min-h-[350px] flex items-center justify-end p-8 md:p-12 border-2 border-white/5">
          <div className="relative z-20 w-full max-w-xl space-y-6 text-center flex flex-col items-center">
            <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
              Stay Updated
            </div>
            <h2 className="text-white text-5xl md:text-6xl font-black leading-none tracking-tight italic uppercase w-full pr-4">
              Subscribe To <span className="text-primary NOT-italic">Our Newsletter</span>
            </h2>
            <p className="text-gray-400 font-bold text-sm max-w-sm">Get early access to deals, coupons, and new products directly in your inbox. No spam, only value.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="grow h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-all font-bold text-sm text-center"
              />
              <Button className="h-12 rounded-xl px-8 font-black text-sm uppercase italic">
                Join Now
              </Button>
            </div>
          </div>

          <div className="absolute inset-0 h-full w-full pointer-events-none opacity-30 md:opacity-100">
            <div className="absolute inset-0 bg-linear-to-l from-slate-950 via-slate-950/80 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"
              className="absolute left-0 top-0 w-2/3 h-full object-cover grayscale opacity-20"
              alt=""
            />
          </div>
        </div>
      </section>

      {/* Sticky WhatsApp Button */}
      <div className="fixed bottom-10 right-10 z-100">
        <Link href="https://wa.me/918142504687" target="_blank" className="relative group flex items-center">
          <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none">
            <p className="text-xs font-black uppercase tracking-widest text-primary whitespace-nowrap">Need Help? Chat Now</p>
          </div>
          <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-90 relative">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="h-8 w-8 invert" />
          </div>
        </Link>
      </div>
    </div>
  );
}

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
      <section className="relative h-[480px] md:h-[650px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[8s] scale-110"
              style={{ backgroundImage: `url(${HERO_BANNERS[currentBanner].image})` }}
            >
              <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/30 to-black/70" />
            </div>
            <div className="relative container mx-auto px-4 md:px-8 h-full flex flex-col justify-center text-white">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-1.5 md:gap-2 bg-primary/90 backdrop-blur-xl px-3 md:px-5 py-1.5 md:py-2 rounded-full mb-5 md:mb-8 border border-white/20 w-fit shadow-xl shadow-primary/20"
              >
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-white fill-white" />
                <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] text-white">Advanced Science Kits</span>
              </motion.div>
              <motion.h1
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black max-w-5xl mb-4 md:mb-8 tracking-tighter leading-[0.9] italic uppercase pr-4 md:pr-12 drop-shadow-2xl"
              >
                {cmsContent?.heroTitle || HERO_BANNERS[currentBanner].title}
              </motion.h1>
              <motion.p
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="text-xs sm:text-lg md:text-2xl max-w-xl mb-8 md:mb-12 text-white/80 font-bold leading-relaxed uppercase tracking-tight md:normal-case md:tracking-normal"
              >
                {cmsContent?.heroSubtitle || HERO_BANNERS[currentBanner].description}
              </motion.p>
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-5 w-full sm:w-auto"
              >
                <Link href={HERO_BANNERS[currentBanner].link} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 md:h-16 rounded-xl md:rounded-2xl px-8 md:px-12 gap-3 text-sm md:text-lg font-black uppercase italic shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                    {HERO_BANNERS[currentBanner].buttonText} <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </Link>
                <Link href="/shop" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 md:h-16 rounded-xl md:rounded-2xl px-8 md:px-12 bg-white/10 backdrop-blur-xl border-white/20 text-white font-black uppercase italic hover:bg-white/20 active:scale-95 transition-all text-sm md:text-lg">
                    Browse All
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Banner Nav Dots */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2.5 md:gap-4 z-20">
          {HERO_BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`h-1 md:h-1.5 rounded-full transition-all duration-700 ${currentBanner === i ? "w-8 md:w-16 bg-primary shadow-lg shadow-primary/50" : "w-1.5 md:w-3 bg-white/30"}`}
            />
          ))}
        </div>
      </section>

      {/* Stats/Trust Badges */}
      <section className="container mx-auto px-4 -mt-8 md:-mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6 bg-white/80 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-black/5">
          {[
            { icon: Truck, label: "Pan India Shipping", color: "text-primary", bg: "bg-primary/10" },
            { icon: ShieldCheck, label: "Verified Quality", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: RefreshCcw, label: "Easy Returns", color: "text-orange-500", bg: "bg-orange-500/10" },
            { icon: Zap, label: "Active Support", color: "text-green-500", bg: "bg-green-500/10" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2 md:gap-4 p-3 md:p-5 hover:bg-slate-50 transition-colors rounded-2xl md:rounded-[2rem] group">
              <div className={`p-3 md:p-5 ${stat.bg} rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-5 w-5 md:h-7 md:w-7 ${stat.color}`} />
              </div>
              <span className="font-black uppercase text-[9px] md:text-xs tracking-widest leading-tight italic">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-8 md:mb-16 gap-4 border-b-2 border-slate-50 pb-8 md:pb-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic pr-0 md:pr-4">Shop by <span className="text-primary NOT-italic">Category</span></h2>
            <p className="text-muted-foreground font-black uppercase text-[9px] md:text-xs tracking-[0.3em] mt-2">The ultimate science gear collection</p>
          </div>
          <Link href="/shop" className="group flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-primary transition-all p-3 md:p-0">
            View All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {(categories.length > 0 ? categories : [
            { name: "Experiments", slug: "experiments" },
            { name: "Gadgets", slug: "gadgets" },
            { name: "Educational", slug: "toys" },
            { name: "Seasonal", slug: "seasonal" }
          ]).slice(0, 4).map((cat) => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`}>
              <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-slate-50 border-2 border-transparent hover:border-primary/10 p-6 md:p-12 text-center transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/5">
                <div className="mb-6 md:mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 flex justify-center text-primary">
                  {cat.slug === 'experiments' && <FlaskConical className="h-10 w-10 md:h-20 md:w-20" />}
                  {cat.slug === 'gadgets' && <Cpu className="h-10 w-10 md:h-20 md:w-20" />}
                  {cat.slug === 'toys' && <Puzzle className="h-10 w-10 md:h-20 md:w-20" />}
                  {cat.slug === 'seasonal' && <Gift className="h-10 w-10 md:h-20 md:w-20" />}
                  {!['experiments', 'gadgets', 'toys', 'seasonal'].includes(cat.slug) && <ShoppingBag className="h-10 w-10 md:h-20 md:w-20" />}
                </div>
                <h3 className="font-black text-sm md:text-xl uppercase tracking-tight italic line-clamp-1">{cat.name}</h3>
                <p className="text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-2 md:mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Explore Category →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-8 md:mb-16 gap-6 md:gap-10">
          <div className="text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/20">
              <Zap className="h-3 w-3 fill-white" /> Hot Arrivals
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Top <span className="text-primary NOT-italic">Performers</span></h2>
          </div>
          <Link href="/shop" className="group flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-primary transition-all p-3 md:p-0">
            Browse Full Shop <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="h-64 md:h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 md:h-10 w-8 md:w-10 animate-spin text-primary" />
            <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground italic">Syncing inventory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Seasonal Promo */}
      {(!cmsContent || cmsContent.showPromoBanner) && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-slate-900 h-auto min-h-[400px] md:min-h-[500px] flex items-center p-8 md:p-20 border border-white/5">
            <div className="relative z-20 w-full max-w-2xl space-y-8 md:space-y-12">
              <div className="inline-block px-5 py-2 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.3em] shadow-2xl">
                Cyber Sale Live
              </div>
              <h2 className="text-white text-5xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter italic uppercase pr-4">
                {cmsContent?.seasonalSaleText || "Gear Up For Science"}
              </h2>
              <p className="text-white/60 font-bold text-sm md:text-lg max-w-sm uppercase tracking-tight">Unlock the future with premium science kits. Limited stock remaining.</p>
              <div className="flex flex-col sm:flex-row gap-8 items-center pt-4">
                <Button size="lg" className="w-full sm:w-auto h-16 md:h-20 rounded-2xl md:rounded-3xl px-12 md:px-16 font-black text-lg md:text-2xl uppercase italic group shadow-2xl shadow-primary/40 active:scale-95 transition-all">
                  Shop Sale <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Time Left</span>
                  <span className="text-primary text-3xl md:text-4xl font-black tabular-nums tracking-tighter italic">12 : 45 : 33</span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 h-full w-full pointer-events-none">
              <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=1200"
                className="absolute right-0 top-0 w-full md:w-2/3 h-full object-cover grayscale opacity-40 mix-blend-overlay"
                alt=""
              />
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-black h-auto min-h-[400px] md:min-h-[500px] flex items-center justify-center md:justify-end p-8 md:p-20 border-2 border-white/5">
          <div className="relative z-20 w-full max-w-xl space-y-10 text-center flex flex-col items-center">
            <div className="inline-block px-5 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
              The Lab Report
            </div>
            <h2 className="text-white text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter italic uppercase">
              Join The <span className="text-primary NOT-italic">Science Elite</span>
            </h2>
            <p className="text-white/40 font-bold text-sm md:text-base max-w-sm uppercase tracking-tight">Stay ahead of the curve. Get exclusive drops and secret deals.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
              <input
                type="email"
                placeholder="Enter email address"
                className="grow h-14 md:h-16 px-8 rounded-xl md:rounded-2xl bg-white/5 border-2 border-white/10 text-white focus:outline-none focus:border-primary transition-all font-black text-sm uppercase tracking-widest text-center"
              />
              <Button className="h-14 md:h-16 rounded-xl md:rounded-2xl px-12 font-black text-sm md:text-base uppercase italic group active:scale-95 transition-all">
                Submit <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="absolute inset-0 h-full w-full pointer-events-none">
            <div className="absolute inset-0 bg-linear-to-l from-black via-black/80 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200"
              className="absolute left-0 top-0 w-full md:w-2/3 h-full object-cover grayscale opacity-20"
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

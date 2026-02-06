"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { CheckCircle2, MapPin, Truck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    usePageTitle("About Us");

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-6xl">
            {/* Hero Section */}
            <div className="text-center space-y-6 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                    Our Story
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
                    Welcome to <span className="text-primary NOT-italic">Teluguexperiments</span>
                    <br />
                    <span className="text-2xl md:text-4xl text-muted-foreground mt-2 block normal-case font-bold tracking-tight">Bringing Experiments to Your Doorstep!</span>
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
                    At Teluguexperiments, we believe that learning should be fun, hands-on, and available in your own language.
                    That’s why we’ve created a platform dedicated to providing science experiment kits, DIY projects, and educational tools — all in Telugu.
                </p>
            </div>

            {/* Mission Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                <div className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Our Mission</h3>
                        <p className="text-muted-foreground font-medium leading-loose">
                            Whether you're a student, parent, teacher, or just a curious mind, our goal is to make science simple and exciting.
                            We offer carefully designed kits and guides that help you explore concepts through real-world experiments — right from your home.
                        </p>
                    </div>
                </div>
                <div className="space-y-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Why Choose <span className="text-primary NOT-italic">Us?</span></h2>
                    <ul className="space-y-6">
                        {[
                            "Easy-to-follow instructions in Telugu",
                            "High-quality, safe experiment kits",
                            "Perfect for kids, schools, and hobbyists",
                            "Supports STEM learning in a fun way",
                            "Doorstep delivery across India"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 group">
                                <div className="p-2 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-bold">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                {[
                    {
                        icon: Clock,
                        label: "Timings",
                        value: "12 AM - 12 AM",
                        subtext: "Always Open Online"
                    },
                    {
                        icon: Truck,
                        label: "Delivering To",
                        value: "All Locations",
                        subtext: "Free Shipping on Orders ₹5,000+"
                    },
                    {
                        icon: MapPin,
                        label: "Location",
                        value: "Siddipet",
                        subtext: "Telangana, India"
                    }
                ].map((info, idx) => (
                    <div key={idx} className="p-8 rounded-[2rem] border-2 border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all text-center space-y-4 group">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <info.icon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{info.label}</h4>
                            <p className="text-xl font-black">{info.value}</p>
                            <p className="text-xs font-bold text-muted-foreground mt-1">{info.subtext}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Call to Action */}
            <div className="rounded-[2.5rem] bg-slate-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20" />
                <div className="relative z-10 px-6 py-20 text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                        Join the <span className="text-primary NOT-italic">Revolution</span>
                    </h2>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg font-medium">
                        Join us in sparking curiosity and inspiring the next generation of innovators — one experiment at a time!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/shop">
                            <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/25">
                                Start Exploring
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-black uppercase tracking-widest bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

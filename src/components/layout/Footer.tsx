"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-slate-950 text-white pt-16 md:pt-24 pb-8 border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-16">
                    {/* Brand and About */}
                    <div className="space-y-6 md:space-y-8">
                        <Link href="/" className="inline-block group">
                            <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter transition-all group-hover:text-primary">
                                Telugu <span className="text-primary NOT-italic">Experiments</span>
                            </h3>
                        </Link>
                        <p className="text-white/40 leading-relaxed text-xs md:text-sm font-bold uppercase tracking-tight">
                            Bringing the frontier of innovation to your doorstep. We curate the world's most advanced science kits and gadgets.
                        </p>
                        <div className="flex space-x-5">
                            {[Facebook, Instagram, Youtube, Twitter].map((Icon, idx) => (
                                <Link key={idx} href="#" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-primary transition-all active:scale-95">
                                    <Icon className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6 md:space-y-8">
                        <h4 className="font-black text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary">Catalog</h4>
                        <ul className="space-y-3">
                            {[
                                { name: "All Products", href: "/shop" },
                                { name: "Science Kits", href: "/shop?category=experiments" },
                                { name: "Cool Gadgets", href: "/shop?category=gadgets" },
                                { name: "Educational Toys", href: "/shop?category=toys" },
                                { name: "Special Offers", href: "/shop?q=sale" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-white/40 hover:text-white font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors flex items-center group">
                                        <div className="h-1 w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policy Links */}
                    <div className="space-y-6 md:space-y-8">
                        <h4 className="font-black text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary">Support</h4>
                        <ul className="space-y-3">
                            {[
                                { name: "Help Center", href: "/contact" },
                                { name: "Track Order", href: "/account/orders" },
                                { name: "Shipping Info", href: "/shipping-policy" },
                                { name: "Return Portal", href: "/returns" },
                                { name: "Privacy Policy", href: "/privacy" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-white/40 hover:text-white font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors flex items-center group">
                                        <div className="h-1 w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6 md:space-y-8">
                        <h4 className="font-black text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary">Headquarters</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-4">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-white/40 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1.5 leading-relaxed">Hyderabad, Telangana State, India</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Phone className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-white/40 font-bold text-[10px] md:text-xs uppercase tracking-widest leading-none">+91 81425 04687</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Mail className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-white/40 font-bold text-[10px] md:text-xs uppercase tracking-widest leading-none truncate pr-2">support@teluguexperiments.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                        © {new Date().getFullYear()} Telugu Experiments Lab. All rights reserved. Made for Science.
                    </p>
                    <div className="flex items-center space-x-6 md:space-x-8 opacity-20 hover:opacity-100 transition-opacity">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3 md:h-4 grayscale invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 md:h-5 grayscale invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 md:h-4 grayscale invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" alt="RuPay" className="h-3 md:h-4 grayscale invert" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

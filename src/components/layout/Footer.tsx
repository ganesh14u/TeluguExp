"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ChevronDown } from "lucide-react";
import { useCurrency, COUNTRIES } from "@/context/CurrencyContext";
import { useState } from "react";

const Footer = () => {
    const pathname = usePathname();
    const { selectedCountry, changeCountry } = useCurrency();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-slate-950 text-white pt-16 md:pt-24 pb-8 border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 md:gap-16 mb-10 md:mb-16">
                    {/* Brand and About */}
                    <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-5 md:space-y-8 flex flex-col items-center text-center sm:items-start sm:text-left md:items-center md:text-center">
                        <Link href="/" className="inline-block group">
                            <img src="/logo.png" alt="Telugu Adventures" className="h-32 md:h-40 w-auto object-contain drop-shadow-2xl group-hover:-translate-y-1 transition-transform duration-500" />
                        </Link>
                        <p className="text-white/40 leading-relaxed text-xs md:text-sm font-bold capitalize tracking-tight mt-2">
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
                    <div className="col-span-1 md:col-span-1 lg:col-span-1 space-y-4 md:space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
                        <h4 className="font-black text-[10px] md:text-xs capitalize tracking-[0.3em] text-primary">Catalog</h4>
                        <ul className="space-y-3 flex flex-col items-center md:items-start w-full">
                            {[
                                { name: "All Products", href: "/shop" },
                                { name: "Science Kits", href: "/shop?category=experiments" },
                                { name: "Cool Gadgets", href: "/shop?category=gadgets" },
                                { name: "Educational Toys", href: "/shop?category=toys" },
                                { name: "Special Offers", href: "/shop?q=sale" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-white/40 hover:text-white font-black text-[10px] md:text-xs capitalize tracking-widest transition-colors flex items-center justify-center md:justify-start group">
                                        <div className="hidden md:block h-1 w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policy Links */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-1 space-y-4 md:space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
                        <h4 className="font-black text-[10px] md:text-xs capitalize tracking-[0.3em] text-primary">Support</h4>
                        <ul className="space-y-3 flex flex-col items-center md:items-start w-full">
                            {[
                                { name: "Help Center", href: "/contact" },
                                { name: "Track Order", href: "/account/orders" },
                                { name: "Shipping Info", href: "/shipping-policy" },
                                { name: "Return Portal", href: "/returns" },
                                { name: "Privacy Policy", href: "/privacy" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-white/40 hover:text-white font-black text-[10px] md:text-xs capitalize tracking-widest transition-colors flex items-center justify-center md:justify-start group">
                                        <div className="hidden md:block h-1 w-0 bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-5 md:space-y-8">
                        <h4 className="font-black text-[10px] md:text-xs capitalize tracking-[0.3em] text-primary text-center sm:text-left md:text-left">Headquarters</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-4">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-white/40 font-bold text-[10px] md:text-xs capitalize tracking-widest mt-1.5 leading-relaxed">Hyderabad, Telangana State, India</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Phone className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-white/40 font-bold text-[10px] md:text-xs capitalize tracking-widest leading-none">+91 81425 04687</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Mail className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-white/40 font-bold text-[10px] md:text-xs capitalize tracking-widest leading-none truncate pr-2">support@teluguadventures.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8 pb-10">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-white/20 italic uppercase">
                            © {new Date().getFullYear()} Telugu Adventures Lab. All rights reserved. 
                            <span className="ml-1 capitalize text-white">
                                Designed With ❤️ By <a href="https://ganeshuk.netlify.app" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 underline transition-all">Sai Ganesh</a>
                            </span>
                        </p>
                        
                        {/* Currency Switcher */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-colors"
                            >
                                <span>{selectedCountry.flag}</span>
                                <span>{selectedCountry.name}</span>
                                <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                            </button>
                            
                            {isDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                                    {COUNTRIES.map((country) => (
                                        <button
                                            key={country.code}
                                            onClick={() => {
                                                changeCountry(country.code);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`flex items-center gap-3 w-full px-4 py-3 text-left text-xs font-black transition-colors ${selectedCountry.code === country.code ? 'bg-primary/20 text-primary' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <span className="text-base">{country.flag}</span>
                                            <span>{country.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 md:space-x-8">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3 md:h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 md:h-5" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 md:h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" alt="RuPay" className="h-3 md:h-4" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

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
        <footer className="bg-muted pt-12 pb-6 border-t">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand and About */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Telugu Experiments
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            Bringing innovation to your doorstep. We specialize in kits, gadgets, and educational toys.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Youtube className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Shop</h4>
                        <ul className="space-y-1 text-sm">
                            <li><Link href="/shop" className="text-muted-foreground hover:text-primary">All Products</Link></li>
                            <li><Link href="/category/experiments" className="text-muted-foreground hover:text-primary">New Kits</Link></li>
                            <li><Link href="/category/gadgets" className="text-muted-foreground hover:text-primary">Cool Gadgets</Link></li>
                            <li><Link href="/category/toys" className="text-muted-foreground hover:text-primary">Toys</Link></li>
                            <li><Link href="/deals" className="text-muted-foreground hover:text-primary">Offers</Link></li>
                        </ul>
                    </div>

                    {/* Policy Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Support</h4>
                        <ul className="space-y-1 text-sm">
                            <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQs</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
                            <li><Link href="/shipping-policy" className="text-muted-foreground hover:text-primary">Shipping</Link></li>
                            <li><Link href="/returns" className="text-muted-foreground hover:text-primary">Returns</Link></li>
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Reach Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3 text-muted-foreground">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span>Hyderabad, Telangana, India</span>
                            </li>
                            <li className="flex items-center space-x-3 text-muted-foreground">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center space-x-3 text-muted-foreground">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span>support@teluguexperiments.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Telugu Experiments. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" alt="RuPay" className="h-4" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

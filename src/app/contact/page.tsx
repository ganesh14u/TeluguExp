"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    usePageTitle("Contact Us");

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-5xl">
            <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                    Get in Touch
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                    Contact <span className="text-primary NOT-italic">Us</span>
                </h1>
                <p className="max-w-xl mx-auto text-muted-foreground font-medium">
                    Have questions about our kits or need assistance? We're here to help you.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Contact Information */}
                <div className="space-y-8">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-8 h-full border border-slate-100">
                        {/* Phone */}
                        <div className="flex items-start gap-6 group">
                            <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                <Phone className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Call Us</h3>
                                <div className="space-y-1">
                                    <a href="tel:8341606873" className="block text-xl font-black hover:text-primary transition-colors">
                                        +91 8341606873
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-6 group">
                            <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Email Us</h3>
                                <a href="mailto:teluguexperimentsshop@gmail.com" className="block text-lg font-bold hover:text-primary transition-colors break-all">
                                    teluguexperimentsshop@gmail.com
                                </a>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-6 group">
                            <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Visit Us</h3>
                                <p className="text-lg font-bold leading-tight">Siddipet</p>
                                <p className="text-muted-foreground font-medium">Siddipet, Telangana, India</p>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=Siddipet,+Telangana,+India"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-colors"
                                >
                                    Check Location on Google Map
                                </a>
                            </div>
                        </div>

                        {/* Timings */}
                        <div className="flex items-start gap-6 group">
                            <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Operational Hours</h3>
                                <p className="text-lg font-bold">12 AM - 12 AM</p>
                                <p className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block mt-1">Always Open Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map / Image Placeholder */}
                <div className="relative h-full min-h-[400px] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-slate-200 bg-slate-100 group">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60742.76632731885!2d78.81747864409395!3d18.101683492582845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcc86f765276e0d%3A0xc3dd33838d72605f!2sSiddipet%2C%20Telangana!5e0!3m2!1sen!2sin!4v1707248000000!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 pointer-events-none border-[1rem] border-white/50 rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
}

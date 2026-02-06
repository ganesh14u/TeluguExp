"use client";

import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [shippingDetails, setShippingDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        phone: ""
    });



    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/users/profile');
                const data = await res.json();
                if (!data.error) {
                    setUserProfile(data);
                    setSavedAddresses(data.addresses || []);
                    if (data.addresses && data.addresses.length > 0) {
                        const defaultAddress = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
                        setShippingDetails({
                            firstName: session?.user?.name?.split(' ')[0] || "",
                            lastName: session?.user?.name?.split(' ').slice(1).join(' ') || "",
                            email: session?.user?.email || "",
                            street: defaultAddress.street || "",
                            city: defaultAddress.city || "",
                            state: defaultAddress.state || "",
                            zipCode: defaultAddress.zipCode || "",
                            phone: defaultAddress.phone || ""
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [session]);

    const handleAddressSelect = (address: any) => {
        setShippingDetails({
            firstName: session?.user?.name?.split(' ')[0] || "",
            lastName: session?.user?.name?.split(' ').slice(1).join(' ') || "",
            email: session?.user?.email || shippingDetails.email || "",
            street: address.street || "",
            city: address.city || "",
            state: address.state || "",
            zipCode: address.zipCode || "",
            phone: address.phone || ""
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) {
            toast.error("Please enter a coupon code");
            return;
        }
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            const data = await res.json();

            if (data.error) {
                toast.error(data.error);
                setDiscount(0);
                setAppliedCoupon(null);
                return;
            }

            let discountAmount = 0;
            const subtotal = totalPrice();

            if (data.discountType === 'Percentage') {
                discountAmount = (subtotal * data.discountValue) / 100;
            } else if (data.discountType === 'Flat') {
                discountAmount = data.discountValue;
            }

            // Cap discount at subtotal
            if (discountAmount > subtotal) discountAmount = subtotal;

            setDiscount(discountAmount);
            setAppliedCoupon(data);
            toast.success(`Coupon ${data.code} applied!`);
        } catch (error) {
            toast.error("Failed to apply coupon");
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setDiscount(0);
        setAppliedCoupon(null);
        toast.info("Coupon removed");
    };

    const loadRazorpaySync = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        try {
            if (!session) {
                toast.error("Please login to place an order");
                return;
            }

            if (!shippingDetails.firstName || !shippingDetails.street || !shippingDetails.phone || !shippingDetails.email) {
                toast.error("Please fill in all shipping details");
                return;
            }

            setLoading(true);

            // 1. Load Razorpay SDK
            const res = await loadRazorpaySync();
            if (!res) {
                toast.error("Razorpay SDK failed to load");
                setLoading(false);
                return;
            }

            const finalTotal = totalPrice() - discount;

            // 2. Create Order on Server (Razorpay)
            const razorpayOrderRes = await fetch("/api/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: finalTotal }),
            });

            const razorpayOrder = await razorpayOrderRes.json();
            if (razorpayOrder.error) throw new Error(razorpayOrder.error);

            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SBWgdWuuYDiVuk", // Fallback for safety
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Telugu Experiments",
                description: "Science Kits & Gadgets",
                image: "/logo.png",
                order_id: razorpayOrder.id,
                handler: async function (response: any) {
                    try {
                        // 4. On Success -> Create Order in DB
                        const orderData = {
                            userId: session.user.id,
                            orderItems: items.map(item => ({
                                productId: item._id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.discountPrice || item.price,
                                image: item.image
                            })),
                            shippingAddress: {
                                name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
                                ...shippingDetails
                            },
                            itemsPrice: totalPrice(),
                            shippingPrice: 0,
                            taxPrice: 0,
                            totalPrice: finalTotal,
                            isPaid: true,
                            paidAt: new Date(),
                            paymentResult: {
                                id: response.razorpay_payment_id,
                                status: "COMPLETED",
                                update_time: new Date().toISOString(),
                                email_address: session.user.email,
                            },
                            orderStatus: "Processing",
                            couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                            discountAmount: discount
                        };

                        const orderRes = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderData)
                        });

                        if (!orderRes.ok) throw new Error("Failed to save order");

                        // Save address if needed
                        if (!savedAddresses || savedAddresses.length === 0) {
                            const newAddress = {
                                name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
                                ...shippingDetails,
                                isDefault: true
                            };
                            await fetch('/api/users/profile', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ addresses: [newAddress] })
                            });
                        }

                        toast.success("Payment Successful! Order placed.");
                        clearCart();
                        setStep(3);
                    } catch (error) {
                        console.error(error);
                        toast.error("Payment successful but failed to save order. Contact support.");
                    }
                },
                prefill: {
                    name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
                    email: shippingDetails.email || session.user.email,
                    contact: shippingDetails.phone,
                },
                theme: {
                    color: "#0f172a", // Match your primary color or slate-900
                },
                modal: {
                    ondismiss: function () {
                        toast.error("Payment Cancelled");
                    },
                    handleback: true,
                    confirm_close: true,
                    escape: true
                },
                retry: {
                    enabled: false
                } // Disable automatic retry to handle failure manually if needed, or keep default
            };

            const paymentObject = new (window as any).Razorpay(options);

            // Listen for failures
            paymentObject.on('payment.failed', function (response: any) {
                toast.error(response.error.description || "Payment Failed. Please try again.");
                console.error("Payment Failed:", response.error);
            });

            paymentObject.open();
            setLoading(false);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong initiating payment");
            setLoading(false);
        }
    };



    if (!mounted) return null;

    if (step === 3) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-8" />
                <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">Order <span className="text-primary NOT-italic">Confirmed</span></h1>
                <p className="text-muted-foreground font-bold mb-10 uppercase tracking-widest text-xs">Your order has been placed successfully. Track its status in your profile.</p>
                <div className="flex justify-center gap-4">
                    <Link href="/account/orders">
                        <Button variant="outline" className="h-14 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] border-2">View My Orders</Button>
                    </Link>
                    <Link href="/">
                        <Button className="h-14 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Back to Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic pr-4">Secure <span className="text-primary NOT-italic">Checkout</span></h1>

                    <Card className="rounded-[2rem] border-2 bg-white">
                        <CardHeader className="border-b border-dashed p-4 md:p-8 bg-muted/10 flex flex-row items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl"><MapPin className="h-6 w-6 text-primary" /></div>
                            <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tighter italic">Shipping <span className="text-primary NOT-italic">Details</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-8">
                            {savedAddresses.length > 0 && (
                                <div className="space-y-4 mb-6 md:mb-8">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Select Saved Address</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {savedAddresses.map((addr, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleAddressSelect(addr)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:border-primary/50 ${shippingDetails.street === addr.street ? 'border-primary bg-primary/5' : 'border-muted'
                                                    }`}
                                            >
                                                <p className="font-black text-[10px] uppercase tracking-widest text-primary mb-1">{addr.name || 'Saved Address'}</p>
                                                <p className="text-xs font-bold truncate opacity-70">{addr.street}</p>
                                                <p className="text-[10px] uppercase font-black opacity-40">{addr.city}, {addr.state}</p>
                                            </div>
                                        ))}
                                        <div
                                            onClick={() => setShippingDetails({
                                                firstName: session?.user?.name?.split(' ')[0] || "",
                                                lastName: session?.user?.name?.split(' ').slice(1).join(' ') || "",
                                                email: session?.user?.email || "",
                                                street: "", city: "", state: "", zipCode: "", phone: ""
                                            })}
                                            className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:bg-muted/50 flex flex-col items-center justify-center text-center ${shippingDetails.street === "" ? 'border-primary bg-primary/5' : 'border-muted'
                                                }`}
                                        >
                                            <p className="font-black text-[10px] uppercase tracking-widest">New Address</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-muted border-dashed border-b mt-8" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                                    <Input
                                        value={shippingDetails.firstName}
                                        onChange={e => setShippingDetails({ ...shippingDetails, firstName: e.target.value })}
                                        placeholder="Enter first name"
                                        className="h-12 rounded-xl border-2"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                                    <Input
                                        value={shippingDetails.lastName}
                                        onChange={e => setShippingDetails({ ...shippingDetails, lastName: e.target.value })}
                                        placeholder="Enter last name"
                                        className="h-12 rounded-xl border-2"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Street Address</label>
                                <Input
                                    value={shippingDetails.street}
                                    onChange={e => setShippingDetails({ ...shippingDetails, street: e.target.value })}
                                    placeholder="House/Appt No, Area/Landmark"
                                    className="h-12 rounded-xl border-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City</label>
                                    <Input
                                        value={shippingDetails.city}
                                        onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                        placeholder="City"
                                        className="h-12 rounded-xl border-2"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">State</label>
                                    <Input
                                        value={shippingDetails.state}
                                        onChange={e => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                                        placeholder="State"
                                        className="h-12 rounded-xl border-2"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ZIP Code</label>
                                    <Input
                                        value={shippingDetails.zipCode}
                                        onChange={e => setShippingDetails({ ...shippingDetails, zipCode: e.target.value })}
                                        placeholder="520001"
                                        className="h-12 rounded-xl border-2"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                <Input
                                    value={shippingDetails.email}
                                    onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                    placeholder="Enter email address"
                                    className="h-12 rounded-xl border-2"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                <Input
                                    value={shippingDetails.phone}
                                    onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                    placeholder="+91..."
                                    className="h-12 rounded-xl border-2"
                                />
                            </div>
                        </CardContent>
                    </Card>


                </div>

                <div className="lg:mt-24">
                    <Card className="rounded-[2.5rem] bg-slate-900 text-white border-none p-10 overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Truck className="h-32 w-32" />
                        </div>
                        <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">Order Summary</h2>
                        <div className="space-y-5 mb-10 relative z-10">
                            {items.map(item => (
                                <div key={item._id} className="flex justify-between items-center text-sm border-b border-white/5 pb-4 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="font-black uppercase text-xs tracking-widest text-white/80 italic">{item.name}</span>
                                        <span className="text-white/40 font-black text-[9px] uppercase tracking-widest mt-1">QTY: {item.quantity}</span>
                                    </div>
                                    <span className="font-black text-primary italic text-lg tracking-tighter">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Coupon Section */}
                        <div className="mb-6 relative z-10 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Promo Code</label>
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/50 p-3 rounded-xl">
                                    <div className="flex flex-col">
                                        <span className="font-black text-green-400 uppercase tracking-widest text-xs">{appliedCoupon.code}</span>
                                        <span className="text-[9px] text-green-400/80 font-bold">Discount Applied</span>
                                    </div>
                                    <Button onClick={handleRemoveCoupon} variant="ghost" size="sm" className="h-8 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 font-black uppercase tracking-widest">
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        className="uppercase placeholder:uppercase border-white/20 bg-white/5 text-white placeholder:text-white/30 font-bold tracking-widest h-11"
                                    />
                                    <Button onClick={handleApplyCoupon} className="font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 h-11 px-6">
                                        Apply
                                    </Button>
                                </div>
                            )}
                        </div>

                        {appliedCoupon && (
                            <div className="flex justify-between items-center text-sm font-bold text-green-400 mb-2 relative z-10">
                                <span className="uppercase tracking-widest">Discount</span>
                                <span>-₹{discount.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-end text-3xl font-black mb-10 pt-4 border-t border-white/10 relative z-10">
                            <span className="italic uppercase tracking-tighter text-white/60 text-xl">Total To Pay</span>
                            <span className="text-primary tracking-tighter italic">₹{(totalPrice() - discount).toLocaleString()}</span>
                        </div>
                        <Button onClick={handlePayment} className="w-full h-16 rounded-2xl text-lg font-black uppercase italic tracking-widest shadow-xl shadow-primary/40 hover:scale-[1.02] transition-transform relative z-10">
                            Complete Purchase Now
                        </Button>

                        <div className="mt-8 flex items-center justify-center gap-4 opacity-40">
                            <div className="h-px bg-white grow" />
                            <div className="text-[9px] font-black uppercase tracking-widest">Secure Checkout</div>
                            <div className="h-px bg-white grow" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

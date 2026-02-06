"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Package, MapPin, LogOut, Settings, Shield, ShoppingCart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { format } from "date-fns";

export default function AccountPage() {
    const { data: session } = useSession();
    const cart = useCart();
    const [orders, setOrders] = useState<any[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            const fetchData = async () => {
                try {
                    const [oRes, uRes] = await Promise.all([
                        fetch(`/api/orders?userId=${session.user.id}`),
                        fetch('/api/users/profile')
                    ]);
                    const oData = await oRes.json();
                    const uData = await uRes.json();
                    if (!oData.error) setOrders(oData);
                    if (!uData.error) setUserData(uData);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [session]);

    if (!session) return null;

    return (
        <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2rem] border-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic pr-4">Welcome Back, <span className="text-primary NOT-italic">{session.user.name?.split(' ')[0]}</span></h1>
                        <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2">Manage your purchases and account details</p>
                    </div>
                    <div className="flex items-center gap-4 bg-muted/30 px-6 py-3 rounded-2xl border">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bag Items</p>
                            <p className="font-black">{cart.totalItems()} Products</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-[2rem] border-2 overflow-hidden bg-white">
                    <CardHeader className="border-b border-dashed p-6 bg-muted/10">
                        <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Basic <span className="text-primary NOT-italic">Profile</span></CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</p>
                                <p className="text-sm font-bold">{session.user.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Member Since</p>
                                <p className="text-sm font-bold">{userData ? format(new Date(userData.createdAt), 'MMM yyyy') : '...'}</p>
                            </div>
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</p>
                            <p className="text-sm font-bold">{session.user.email}</p>
                        </div>
                        <Link href="/account/settings">
                            <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-black uppercase tracking-widest text-[10px]">Edit Profile Details</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-2 overflow-hidden bg-white">
                    <CardHeader className="border-b border-dashed p-6 bg-muted/10">
                        <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Recent <span className="text-primary NOT-italic">Orders</span></CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {loading ? (
                            <div className="flex justify-center py-8 italic font-bold text-muted-foreground">Loading...</div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-4 w-full">
                                {orders.slice(0, 2).map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/5 group hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-white border-2 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tighter italic">Order #{order._id.slice(-6)}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-primary">₹{order.totalPrice.toLocaleString()}</p>
                                            <p className="text-[10px] font-black uppercase text-green-600">{order.orderStatus}</p>
                                        </div>
                                    </div>
                                ))}
                                <Link href="/account/orders" className="block text-center mt-4">
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">View All Orders</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">No Recent Orders</p>
                                    <p className="text-xs text-muted-foreground font-medium">Start shopping to see your orders here.</p>
                                </div>
                                <Link href="/shop">
                                    <Button className="h-12 rounded-xl px-8 font-black uppercase tracking-widest text-[10px]">Shop Products Now</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

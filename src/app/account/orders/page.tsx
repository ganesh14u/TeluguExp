"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetch(`/api/orders?userId=${session.user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setOrders(data);
                    setLoading(false);
                });
        }
    }, [session]);

    return (
        <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2rem] border-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic pr-4">My <span className="text-primary NOT-italic">Orders</span></h1>
                <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2">Track and manage your purchase history</p>
            </section>

            {loading ? (
                <div className="flex justify-center py-20 italic font-bold text-muted-foreground">Loading your orders...</div>
            ) : orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order._id} className="rounded-[2rem] border-2 overflow-hidden bg-white hover:border-primary/20 transition-all">
                            <CardContent className="p-0">
                                <div className="bg-muted/30 p-6 flex flex-col md:flex-row justify-between gap-4 border-b border-dashed">
                                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Date</p>
                                            <p className="text-sm font-bold">{format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Price</p>
                                            <p className="text-sm font-black text-primary">₹{order.totalPrice.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</p>
                                            <p className="text-sm font-bold uppercase">#{order._id.slice(-8)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.orderStatus}
                                        </div>
                                        <Link href={`/account/orders/${order._id}`}>
                                            <Button variant="outline" className="h-9 rounded-xl border-2 font-black uppercase tracking-widest text-[9px]">View Details</Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {order.orderItems.map((item: any) => (
                                        <div key={item._id} className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-xl border-2 overflow-hidden bg-muted shrink-0">
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="grow">
                                                <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">₹{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[2.5rem] border-2 overflow-hidden bg-white min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">No Orders Found</h2>
                    <p className="text-muted-foreground font-bold max-w-md mb-8">You haven't placed any orders yet. Explore our latest collections and start shopping!</p>
                    <Link href="/shop">
                        <Button className="h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                            Start Shopping Now
                        </Button>
                    </Link>
                </Card>
            )}
        </div>
    );
}


"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Truck, CheckCircle, Package, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Script from "next/script";

export default function OrderDetailsPage() {
    const { data: session } = useSession();
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id && params.id) {
            fetch(`/api/orders?id=${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setOrder(data);
                    setLoading(false);
                });
        }
    }, [session, params.id]);

    const downloadInvoice = () => {
        const element = document.getElementById('invoice-content');
        const opt = {
            margin: 10,
            filename: `Invoice_${order._id.slice(-8).toUpperCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        if (window.html2pdf) {
            // @ts-ignore
            window.html2pdf().set(opt).from(element).save();
        } else {
            alert("PDF Generator is loading, please wait...");
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20 italic font-bold text-muted-foreground">Loading order details...</div>;
    }

    if (!order) {
        return <div className="text-center py-20 font-bold">Order not found</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />

            <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">Order <span className="text-primary NOT-italic">#{order._id?.slice(-6) || '...'}</span></h1>
                    <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2">
                        {order.createdAt ? format(new Date(order.createdAt), 'MMMM dd, yyyy') : '...'} • {order.createdAt ? format(new Date(order.createdAt), 'hh:mm a') : '...'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={downloadInvoice} variant="outline" className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-2">
                        <Download className="h-4 w-4" /> Download Invoice
                    </Button>
                    <Badge className={`h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                            'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}>
                        {order.orderStatus}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card className="rounded-[2rem] border-2 bg-white overflow-hidden">
                        <CardHeader className="border-b border-dashed p-8 bg-muted/10">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" /> Order <span className="text-primary NOT-italic">Items</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {order.orderItems?.map((item: any) => (
                                <div key={item._id} className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-2xl border-2 overflow-hidden bg-muted shrink-0">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="grow">
                                        <h4 className="font-bold text-base line-clamp-1">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground font-medium mt-1">Quantity: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-2 bg-white overflow-hidden">
                        <CardHeader className="border-b border-dashed p-8 bg-muted/10">
                            <CardTitle className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
                                <Truck className="h-5 w-5 text-primary" /> Shipping <span className="text-primary NOT-italic">Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</p>
                                <p className="font-bold">{order.shippingAddress.name}</p>
                                <p className="text-sm text-muted-foreground font-medium">{order.shippingAddress.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Address</p>
                                <p className="text-sm font-bold leading-relaxed">
                                    {order.shippingAddress.street}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1 space-y-8">
                    <Card className="rounded-[2rem] border-2 bg-slate-900 text-white border-none overflow-hidden relative shadow-xl">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <CheckCircle className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8 relative z-10 space-y-6">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Summary</h3>

                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/60">Subtotal</span>
                                    <span className="font-bold">₹{order.itemsPrice?.toLocaleString() || order.totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/60">Shipping</span>
                                    <span className="font-bold text-green-400">Free</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/60">Tax</span>
                                    <span className="font-bold">₹0</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <div className="flex justify-between items-end">
                                    <span className="font-black text-white/60 text-sm uppercase tracking-widest">Total Paid</span>
                                    <span className="text-3xl font-black italic tracking-tighter text-primary">₹{order.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Hidden Invoice Template for PDF Generation */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div id="invoice-content">
                    <style>{`
                        #invoice-content { width: 800px; padding: 30px; background: #fff; font-family: Arial, sans-serif; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
                        .info { display: flex; justify-content: space-between; margin: 20px 0; }
                        .info-col { width: 48%; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border-bottom: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f8f9fa; }
                        .total { text-align: right; margin-top: 20px; font-size: 1.25rem; }
                        .paid { color: green; font-weight: bold; border: 2px solid green; padding: 5px 10px; border-radius: 5px; display: inline-block; margin-top: 10px; }
                    `}</style>
                    <div className="header">
                        <div>
                            <h2 style={{ margin: 0, color: '#333' }}>INVOICE</h2>
                            <p style={{ margin: '5px 0', color: '#666' }}>Order ID: #{order._id.slice(-8).toUpperCase()}</p>
                            <p style={{ margin: 0, color: '#666' }}>Date: {format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 style={{ margin: 0, color: '#000' }}>Telugu Experiments</h3>
                        </div>
                    </div>

                    <div className="info">
                        <div className="info-col">
                            <h4 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Bill To</h4>
                            <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{order.shippingAddress.name}</p>
                            <p style={{ margin: '2px 0' }}>{order.shippingAddress.phone}</p>
                            <p style={{ margin: '2px 0' }}>{session?.user?.email}</p>
                        </div>
                        <div className="info-col">
                            <h4 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Ship To</h4>
                            <p style={{ margin: '5px 0' }}>{order.shippingAddress.street}</p>
                            <p style={{ margin: '2px 0' }}>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                                <th style={{ width: '120px', textAlign: 'right' }}>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item: any) => (
                                <tr key={item._id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>₹{item.price.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="total">
                        <div style={{ marginBottom: '10px' }}>Total: <span style={{ fontWeight: 'bold' }}>₹{order.totalPrice.toLocaleString()}</span></div>
                        <span className="paid">PAID</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

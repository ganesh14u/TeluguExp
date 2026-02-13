"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Eye,
    Download,
    Filter,
    Loader2,
    RefreshCw,
    Trash2,
    Package,
    CheckCircle,
    Clock,
    Truck,
    ShieldAlert
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { usePageTitle } from "@/hooks/usePageTitle";
import Script from "next/script";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useAdminNotifications } from "@/context/AdminNotificationContext";

export default function AdminOrdersPage() {
    usePageTitle("Admin - Orders");
    const { clearAll } = useAdminNotifications();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const [statusFilter, setStatusFilter] = useState("All");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/orders", { cache: 'no-store' });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setOrders(data);
        } catch (error: any) {
            toast.error("Failed to fetch orders: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        clearAll();
    }, [clearAll]);

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            const res = await fetch("/api/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: orderId, orderStatus: status })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success(`Order status updated to ${status}`);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure? This will permanently delete the order record.")) return;
        try {
            const res = await fetch(`/api/orders?id=${orderId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success("Order deleted successfully");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openDetails = (order: any) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const handlePrint = () => {
        if (!selectedOrder) return;
        window.print();
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Order ID,Customer Name,Date,Amount,Status,City\n"
            + filteredOrders.map(o => `${o._id},"${o.shippingAddress?.name || ''}",${new Date(o.createdAt).toLocaleDateString()},${o.totalPrice},${o.orderStatus},"${o.shippingAddress?.city || ''}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order._id.toLowerCase().includes(search.toLowerCase()) ||
            order.shippingAddress?.name?.toLowerCase().includes(search.toLowerCase()) ||
            order.shippingAddress?.city?.toLowerCase().includes(search.toLowerCase()) ||
            order.orderStatus.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = statusFilter === "All" || order.orderStatus === statusFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-10 p-2">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic pr-4">Store <span className="text-primary NOT-italic">Orders</span></h1>
                    <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2 italic opacity-70">View and manage all customer orders.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchOrders} disabled={loading} className="rounded-2xl h-14 w-14 border-2 shadow-sm">
                    <RefreshCw className={`h-5 w-5 ${loading && "animate-spin"}`} />
                </Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between bg-muted/30 p-6 rounded-[2rem] border-2 border-dashed border-primary/10">
                <div className="relative w-full md:w-md group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by ID, Name or City..."
                        className="pl-14 h-16 bg-white border-2 rounded-2xl focus-visible:ring-primary shadow-sm text-lg font-bold"
                        value={search}
                        onChange={(e: any) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 gap-3 hover:bg-black hover:text-white transition-all w-40">
                            <SelectValue placeholder="FILTER" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 font-bold uppercase text-[10px] tracking-widest">
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleExport} className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all italic">
                        <Download className="h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            <div className="bg-background border-2 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-2">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="h-20 pl-10 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Order ID</TableHead>
                            <TableHead className="h-20 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Customer</TableHead>
                            <TableHead className="h-20 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Order Date</TableHead>
                            <TableHead className="h-20 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Amount</TableHead>
                            <TableHead className="h-20 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Status</TableHead>
                            <TableHead className="h-20 text-right pr-10 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-80 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Orders...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-80 text-center">
                                    <p className="text-muted-foreground font-black uppercase opacity-20 text-4xl italic tracking-tighter">No Orders Found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order._id} className="group hover:bg-primary/2 transition-colors border-muted/20">
                                    <TableCell className="pl-10 py-8 font-black text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <span className="tracking-tighter font-black opacity-40">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-black text-xl tracking-tight uppercase italic">{order.shippingAddress?.name || "GUEST"}</span>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase mt-1 tracking-[0.2em] opacity-50">{order.shippingAddress?.city}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-black text-muted-foreground italic">
                                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="font-black text-primary text-2xl tracking-tighter italic">₹{(order.totalPrice || 0).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={order.orderStatus}
                                            onValueChange={(val: any) => handleStatusUpdate(order._id, val)}
                                        >
                                            <SelectTrigger className={`w-36 h-10 rounded-xl font-black uppercase text-[9px] tracking-widest border-2 ${order.orderStatus === 'Delivered' ? 'text-green-600 bg-green-50 border-green-200' :
                                                order.orderStatus === 'Cancelled' ? 'text-red-600 bg-red-50 border-red-200' :
                                                    'text-primary bg-primary/5 border-primary/20'
                                                }`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 font-bold uppercase text-[10px] tracking-widest">
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Processing">Processing</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => openDetails(order)}>
                                                <Eye className="h-6 w-6" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all" onClick={() => handleDeleteOrder(order._id)}>
                                                <Trash2 className="h-6 w-6" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Order Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="invoice-modal-content max-w-4xl p-0 bg-white rounded-2xl shadow-2xl border-none overflow-hidden my-8 h-[90vh] flex flex-col">
                    <DialogTitle className="sr-only">Order Details</DialogTitle>
                    <style suppressHydrationWarning>{`
                        @media print {
                            /* Remove browser headers and footers */
                            @page { 
                                size: auto; 
                                margin: 0; 
                            }
                            
                            body { 
                                visibility: hidden !important;
                                background: white !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            
                            /* Fix for double pages and layout */
                            .print-container {
                                visibility: visible !important;
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 25mm !important; /* Standard print padding */
                                background: white !important;
                                color: black !important;
                                display: block !important;
                                height: auto !important;
                                min-height: 0 !important;
                                overflow: visible !important;
                            }

                            .no-print {
                                display: none !important;
                            }
                        }
                    `}</style>

                    {selectedOrder && (
                        /* --- SINGLE VIEW FOR BOTH SCREEN ACND PRINT --- */
                        <div className="flex flex-col h-full print:h-auto">
                            {/* Header */}
                            <div className="bg-slate-950 text-white p-6 flex justify-between items-center shrink-0">
                                <div>
                                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Order Details</p>
                                    <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 italic">
                                        #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}
                                        <Badge className={`px-3 py-1 rounded-lg font-black uppercase text-[10px] tracking-widest ${selectedOrder.isPaid ? 'bg-green-500 text-white border-none' : 'bg-amber-500 text-white border-none'
                                            }`}>
                                            {selectedOrder.isPaid ? 'PAID' : 'PENDING'}
                                        </Badge>
                                    </h2>
                                    <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold mt-2 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {format(new Date(selectedOrder.createdAt), "MMM d, yyyy")}</span>
                                        <span>•</span>
                                        <span>{selectedOrder.paymentMethod || 'Razorpay'}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="bg-white/5 text-white border-white/20 hover:bg-white/10 rounded-xl h-10 px-6 font-bold uppercase tracking-widest text-[10px] print:hidden" onClick={() => setIsDetailsOpen(false)}>
                                    Close
                                </Button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><ShieldAlert className="w-4 h-4" /></div>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</h3>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900 uppercase italic text-lg tracking-tight">{selectedOrder.shippingAddress?.name}</p>
                                            <p className="text-sm text-slate-500 font-bold">{selectedOrder.shippingAddress?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Truck className="w-4 h-4" /></div>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shipping</h3>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900 uppercase italic text-sm tracking-tight line-clamp-1">{selectedOrder.shippingAddress?.street}</p>
                                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-4">Order Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.orderItems.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 py-2 border-b border-dashed border-slate-100 last:border-0">
                                                <div className="h-12 w-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                                    {item.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center"><Package className="h-4 w-4 text-slate-400" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-900 text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Breakdown */}
                                <div className="bg-slate-950 rounded-2xl p-6 text-white text-right space-y-1 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <CheckCircle className="h-24 w-24" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Final Summary</p>
                                    <div className="flex justify-between items-center text-sm font-bold text-white/60">
                                        <span>Subtotal</span>
                                        <span>₹{(selectedOrder.totalPrice + (selectedOrder.discountAmount || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-4 border-t border-white/10 mt-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Amount</span>
                                        <span className="text-4xl font-black italic tracking-tighter text-primary">₹{(selectedOrder.totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 no-print shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                                <Button onClick={handlePrint} className="h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:scale-105 transition-all italic gap-3">
                                    <Download className="h-4 w-4" /> Print Invoice
                                </Button>
                            </div>

                            {/* This is the container that will be visible in Print */}
                            <div className="hidden print:block print-container" style={{ width: '100%' }}>
                                <div style={{ marginBottom: '45px' }}>
                                    <p style={{ color: '#000', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>Order Details</p>
                                    <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#000', margin: '0 0 10px 0' }}>#{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                                    <p style={{ fontSize: '15px', fontWeight: '900', color: '#16a34a', margin: '0' }}>{selectedOrder.isPaid ? 'PAID' : 'PENDING'}</p>
                                    <p style={{ fontSize: '15px', fontWeight: '900', color: '#000', margin: '6px 0 0 0' }}>{format(new Date(selectedOrder.createdAt), 'MMM d, yyyy')}</p>
                                    <p style={{ fontSize: '15px', fontWeight: '900', color: '#000', margin: '6px 0 0 0' }}>• {selectedOrder.paymentMethod || 'Razorpay'}</p>
                                </div>

                                <div style={{ marginBottom: '45px' }}>
                                    <p style={{ color: '#000', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>Customer</p>
                                    <p style={{ fontSize: '18px', fontWeight: '900', color: '#000', margin: '0' }}>{selectedOrder.shippingAddress?.name}</p>
                                    <p style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '6px 0 0 0' }}>{selectedOrder.shippingAddress?.phone}</p>
                                </div>

                                <div style={{ marginBottom: '45px' }}>
                                    <p style={{ color: '#000', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>Shipping</p>
                                    <p style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '0' }}>{selectedOrder.shippingAddress?.street}</p>
                                    <p style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '6px 0 0 0' }}>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                    <p style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '6px 0 0 0' }}>{selectedOrder.shippingAddress?.zipCode}</p>
                                </div>

                                <div style={{ marginBottom: '45px' }}>
                                    <p style={{ color: '#000', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>Order Items</p>
                                    <div style={{ borderTop: '4px solid #000' }}>
                                        {selectedOrder.orderItems.map((item: any, idx: number) => (
                                            <div key={idx} style={{ padding: '20px 0', borderBottom: '1px solid #eee' }}>
                                                <p style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '0' }}>{item.name}</p>
                                                <p style={{ fontSize: '14px', fontWeight: '900', color: '#000', margin: '6px 0 0 0' }}>Qty: {item.quantity}</p>
                                                <p style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '6px 0 0 0' }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ width: '100%', marginTop: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '18px', color: '#000', fontWeight: '900' }}>Subtotal</span>
                                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#000' }}>₹{(selectedOrder.totalPrice + (selectedOrder.discountAmount || 0)).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '5px solid #000' }}>
                                        <span style={{ fontSize: '22px', fontWeight: '900', color: '#000' }}>Total</span>
                                        <span style={{ fontSize: '26px', fontWeight: '900', color: '#000' }}>₹{selectedOrder.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '2px solid #000', paddingTop: '10px' }}>
                                    <p style={{ color: '#000', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.6em' }}>Telugu Experiments</p>
                                </div>
                            </div>

                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}

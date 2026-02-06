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

export default function AdminOrdersPage() {
    usePageTitle("Admin - Orders");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const [statusFilter, setStatusFilter] = useState("All");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/orders");
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
    }, []);

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

    const downloadInvoice = () => {
        if (!selectedOrder) return;
        const element = document.getElementById('invoice-content');
        const opt = {
            margin: 10,
            filename: `Invoice_${selectedOrder._id.slice(-8).toUpperCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        if (window.html2pdf) {
            // @ts-ignore
            window.html2pdf().set(opt).from(element).save();
        } else {
            toast.error("PDF Generator is loading, please wait...");
        }
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
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />

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
                <DialogContent className="invoice-modal-content max-w-4xl p-0 bg-white rounded-xl shadow-2xl border-none overflow-hidden my-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <DialogTitle className="sr-only">Order Details</DialogTitle>
                    <style suppressHydrationWarning>{`
                        @media print {
                            body { 
                                visibility: hidden; 
                            }
                            
                            /* TARGET THE RADIX DIALOG CONTENT DIRECTLY */
                            .invoice-modal-content {
                                visibility: visible !important;
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                max-width: none !important;
                                height: auto !important;
                                min-height: 100vh !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                transform: none !important;
                                border: none !important;
                                box-shadow: none !important;
                                background: white !important;
                                overflow: visible !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            
                            /* Make all children visible */
                            .invoice-modal-content * {
                                visibility: visible !important;
                            }

                            /* Hide specific elements */
                            .no-print, .print\\:hidden { display: none !important; }

                            /* PAGE SETTINGS */
                            @page { 
                                size: auto; 
                                margin: 0mm; 
                            }
                        }
                    `}</style>

                    {selectedOrder && (
                        /* --- SINGLE VIEW FOR BOTH SCREEN ACND PRINT --- */
                        <div className="flex flex-col h-full print:h-auto">
                            {/* Header */}
                            {/* Header */}
                            <div className="bg-slate-900 text-white p-6 flex justify-between items-start shrink-0">
                                <div>
                                    <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mb-1">Order Details</p>
                                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                        #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}
                                        <Badge className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${selectedOrder.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {selectedOrder.isPaid ? 'PAID' : 'PENDING'}
                                        </Badge>
                                    </h2>
                                    <div className="flex items-center gap-3 text-slate-400 text-sm mt-2">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(selectedOrder.createdAt), "MMM d, yyyy")}</span>
                                        <span>•</span>
                                        <span>{selectedOrder.paymentMethod || 'Online'}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 print:hidden" onClick={() => setIsDetailsOpen(false)}>
                                    Close
                                </Button>
                            </div>

                            {/* Scrollable Content - Expands in Print */}
                            <div className="p-6 overflow-y-auto space-y-8 print:overflow-visible print:h-auto">
                                {/* Panels */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><ShieldAlert className="w-3 h-3" /></div>
                                            Customer
                                        </h3>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-bold text-slate-900">{selectedOrder.shippingAddress?.name}</p>
                                            <p className="text-slate-600">{selectedOrder.userId?.email}</p>
                                            <p className="text-slate-600">{selectedOrder.shippingAddress?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><Truck className="w-3 h-3" /></div>
                                            Shipping
                                        </h3>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-bold text-slate-900">{selectedOrder.shippingAddress?.street}</p>
                                            <p className="text-slate-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                            <p className="text-slate-600 font-mono text-xs">{selectedOrder.shippingAddress?.zipCode}</p>
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
                                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-medium text-slate-900">₹{(selectedOrder.totalPrice + (selectedOrder.discountAmount || 0)).toLocaleString()}</span>
                                    </div>
                                    {selectedOrder.couponCode && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span className="font-medium flex items-center gap-1">Coupons <span className="text-[10px] bg-green-100 px-1.5 rounded">{selectedOrder.couponCode}</span></span>
                                            <span className="font-bold">-₹{selectedOrder.discountAmount?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg pt-2 border-t border-slate-200 mt-2">
                                        <span className="font-bold text-slate-900">Total</span>
                                        <span className="font-black text-primary">₹{(selectedOrder.totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action - HIDDEN IN PRINT */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0 print:hidden">
                                <Button onClick={downloadInvoice} className="w-full sm:w-auto gap-2 font-bold uppercase tracking-wide">
                                    Print Invoice
                                </Button>
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
                                            <p style={{ margin: '5px 0', color: '#666' }}>Order ID: #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                            <p style={{ margin: 0, color: '#666' }}>Date: {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <h3 style={{ margin: 0, color: '#000' }}>Telugu Experiments</h3>
                                        </div>
                                    </div>

                                    <div className="info">
                                        <div className="info-col">
                                            <h4 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Bill To</h4>
                                            <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{selectedOrder.shippingAddress?.name}</p>
                                            <p style={{ margin: '2px 0' }}>{selectedOrder.shippingAddress?.phone}</p>
                                            <p style={{ margin: '2px 0' }}>{selectedOrder.userId?.email || "Guest"}</p>
                                        </div>
                                        <div className="info-col">
                                            <h4 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Ship To</h4>
                                            <p style={{ margin: '5px 0' }}>{selectedOrder.shippingAddress?.street}</p>
                                            <p style={{ margin: '2px 0' }}>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode}</p>
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
                                            {selectedOrder.orderItems.map((item: any, idx: number) => (
                                                <tr key={idx}>
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
                                        <div style={{ marginBottom: '10px' }}>Total: <span style={{ fontWeight: 'bold' }}>₹{selectedOrder.totalPrice.toLocaleString()}</span></div>
                                        <span className="paid">PAID</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

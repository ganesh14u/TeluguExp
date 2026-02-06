"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import {
    TrendingUp,
    Users,
    ShoppingCart,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Hardcoded data removed, using dynamic data from API

import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setStats(data.stats);
                setRecentOrders(data.recentOrders);
                setSalesData(data.salesData);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, trend: "+12.5%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Total Orders", value: stats.totalOrders.toString(), trend: "+8.2%", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Total Users", value: stats.totalUsers.toString(), trend: "+14.0%", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Total Products", value: stats.totalProducts.toString(), trend: "+4", icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="space-y-10 p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic pr-4">Admin <span className="text-primary NOT-italic">Dashboard</span></h1>
                    <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2 italic opacity-70">See how your store is performing today.</p>
                </div>
                <Badge className="h-12 px-6 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px] italic">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-3 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                    System Online
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="border-2 shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden bg-white group hover:border-primary transition-all duration-500">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:bg-primary group-hover:text-white transition-colors duration-500`}>
                                    <stat.icon className="h-7 w-7" />
                                </div>
                                <div className={`flex items-center gap-1 font-black text-[10px] uppercase tracking-tighter ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {stat.trend.startsWith('+') ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="mt-8">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic opacity-60">{stat.title}</p>
                                <h3 className="text-4xl font-black mt-2 tracking-tighter italic">
                                    {loading ? <Loader2 className="h-8 w-8 animate-spin opacity-10" /> : stat.value}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Card className="lg:col-span-2 border-2 shadow-2xl shadow-black/5 rounded-[3rem] p-8 bg-white overflow-hidden group">
                    <CardHeader className="pb-8 border-b-2 border-dashed flex flex-row items-center justify-between">
                        <CardTitle className="text-3xl font-black uppercase italic tracking-tighter">Sales <span className="text-primary NOT-italic">Report</span></CardTitle>
                        <Select defaultValue="7d">
                            <SelectTrigger className="w-40 rounded-xl h-10 border-2 font-black uppercase text-[10px] tracking-widest">
                                <SelectValue placeholder="Timeframe" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-2 font-bold uppercase text-[10px] tracking-widest">
                                <SelectItem value="24h">Last 24 Hours</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="h-[400px] pt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'hsl(var(--muted-foreground))', letterSpacing: '2px' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: '2px solid hsl(var(--primary) / 0.1)', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.1)', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', padding: '15px' }}
                                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 3 }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1 border-2 shadow-2xl shadow-black/5 rounded-[3rem] bg-white overflow-hidden group">
                    <CardHeader className="pb-8 border-b-2 border-dashed">
                        <CardTitle className="text-3xl font-black uppercase italic tracking-tighter">Recent <span className="text-primary NOT-italic">Orders</span></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-8">
                        {recentOrders.length === 0 && !loading ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center opacity-30">
                                <ShoppingCart className="h-10 w-10 mb-4" />
                                <p className="font-black uppercase tracking-widest text-[10px]">No recent orders found</p>
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <Link
                                    href={`/admin/orders`}
                                    key={order._id}
                                    className="flex items-center justify-between group/signal cursor-pointer hover:bg-muted/30 p-4 rounded-2xl transition-all border-2 border-transparent hover:border-primary/10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-black text-[10px] ring-4 ring-transparent group-hover/signal:ring-primary/10 transition-all uppercase italic">
                                            #{order._id.substring(order._id.length - 4)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase italic tracking-tight">{order.shippingAddress?.name || "ANON"}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className="text-[8px] font-black uppercase tracking-tighter h-5 px-2 bg-primary/10 text-primary border-none">{order.orderStatus}</Badge>
                                                <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40 italic">{format(new Date(order.createdAt), "HH:mm")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-black text-lg tracking-tighter italic">₹{(order.totalPrice || 0).toLocaleString()}</span>
                                </Link>
                            ))
                        )}

                        <Link href="/admin/orders" className="block w-full text-center py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-all border-t-2 border-dashed mt-6 italic group-hover:tracking-[0.5em]">
                            View All Orders →
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}


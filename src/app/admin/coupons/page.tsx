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
import { Plus, Copy, Trash2, Tag, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discountType: "Percentage",
        discountValue: "",
        expiryDate: ""
    });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/coupons");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setCoupons(data);
        } catch (error: any) {
            toast.error("Failed to fetch coupons: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Coupon code copied to clipboard!");
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newCoupon,
                    discountValue: Number(newCoupon.discountValue)
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success("Coupon code generated! 🚀");
            setIsDialogOpen(false);
            setNewCoupon({ code: "", discountType: "Percentage", discountValue: "", expiryDate: "" });
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deactivate this promotional code?")) return;
        try {
            const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Discount <span className="text-primary NOT-italic">Matrix</span></h1>
                    <p className="text-muted-foreground font-medium">Engineer promotional campaigns to drive laboratory sales.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchCoupons} disabled={loading} className="rounded-xl">
                        <RefreshCw className={`h-4 w-4 ${loading && "animate-spin"}`} />
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 rounded-xl h-12 px-6 font-bold shadow-xl shadow-primary/20">
                                <Plus className="h-4 w-4" /> Generate Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Engine <span className="text-primary NOT-italic">Discount Code</span></DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-5 mt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Promo Code</label>
                                    <Input
                                        placeholder="e.g. SUMMER50"
                                        className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary font-black font-mono tracking-widest uppercase"
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Type</label>
                                        <Select
                                            value={newCoupon.discountType}
                                            onValueChange={(val) => setNewCoupon({ ...newCoupon, discountType: val })}
                                        >
                                            <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-none focus:ring-2 focus:ring-primary font-bold">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-xl">
                                                <SelectItem value="Percentage">Percentage</SelectItem>
                                                <SelectItem value="Flat">Flat Amount</SelectItem>
                                                <SelectItem value="Shipping">Free Shipping</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Value</label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 20"
                                            className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary font-bold"
                                            value={newCoupon.discountValue}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                                            required={newCoupon.discountType !== "Shipping"}
                                            disabled={newCoupon.discountType === "Shipping"}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Valid Until</label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary font-bold"
                                        value={newCoupon.expiryDate}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">Authorize Campaign</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-background border rounded-[2.5rem] overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="h-16 pl-8 font-black uppercase text-xs tracking-widest text-muted-foreground">Promo Code</TableHead>
                            <TableHead className="h-16 font-black uppercase text-xs tracking-widest text-muted-foreground">Benefit</TableHead>
                            <TableHead className="h-16 font-black uppercase text-xs tracking-widest text-muted-foreground">Category</TableHead>
                            <TableHead className="h-16 font-black uppercase text-xs tracking-widest text-muted-foreground">Expiration</TableHead>
                            <TableHead className="h-16 font-black uppercase text-xs tracking-widest text-muted-foreground">Adoption Rate</TableHead>
                            <TableHead className="h-16 text-right pr-8 font-black uppercase text-xs tracking-widest text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    <p className="mt-2 text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">Decoding offer encrypted keys...</p>
                                </TableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <p className="text-muted-foreground font-bold">No active promotional campaigns.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((c) => (
                                <TableRow key={c._id} className="group hover:bg-muted/30 border-muted/20">
                                    <TableCell className="pl-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <Tag className="h-4 w-4 text-primary" />
                                            <code className="font-mono bg-primary/5 text-primary px-3 py-1 rounded-lg font-black tracking-widest border border-primary/10">{c.code}</code>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyCode(c.code)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-base italic">
                                        {c.discountType === 'Percentage' ? `${c.discountValue}% OFF` : c.discountType === 'Flat' ? `₹${c.discountValue} OFF` : 'FREE SHIPPING'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground">
                                            {c.discountType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-bold text-muted-foreground">
                                        {format(new Date(c.expiryDate), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm">{c.usedCount}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Adoptions</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleDelete(c._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

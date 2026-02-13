"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../../../components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Loader2, RefreshCw, X, ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

export default function AdminProductsPage() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get("category");

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [paymentMode, setPaymentMode] = useState<"test" | "live" | "loading">("loading");
    const [updatingMode, setUpdatingMode] = useState(false);

    const [productForm, setProductForm] = useState({
        name: "",
        slug: "",
        description: "",
        sku: "",
        category: "",
        price: "",
        discountPrice: "",
        stock: "",
        videoUrl: "",
        images: [""]
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setProducts(data);
        } catch (error: any) {
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (data.paymentMode) {
                setPaymentMode(data.paymentMode);
            } else {
                setPaymentMode("test");
            }
        } catch (e) {
            setPaymentMode("test");
        }
    };

    const togglePaymentMode = async () => {
        const newMode = paymentMode === "test" ? "live" : "test";
        setUpdatingMode(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "paymentMode", value: newMode })
            });
            if (res.ok) {
                setPaymentMode(newMode);
                toast.success(`Payment Mode switched to ${newMode.toUpperCase()}`);
            }
        } catch (e) {
            toast.error("Failed to update payment mode");
        } finally {
            setUpdatingMode(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (!data.error) setCategories(data);
        } catch (e) { }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingProduct ? "PUT" : "POST";
        const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";

        const validImages = productForm.images.filter(img => img.trim() !== "");

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...productForm,
                    price: Number(productForm.price),
                    discountPrice: Number(productForm.discountPrice) || undefined,
                    stock: Number(productForm.stock) || 0,
                    images: validImages,
                    image: validImages[0] || ""
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success(editingProduct ? "Product updated!" : "Product added!");
            setIsDialogOpen(false);
            resetForm();
            fetchProducts();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success("Product deleted");
            fetchProducts();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setProductForm({
            name: "", slug: "", description: "", sku: "",
            category: "", price: "", discountPrice: "",
            stock: "", videoUrl: "", images: [""]
        });
        setEditingProduct(null);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            slug: product.slug,
            description: product.description,
            sku: product.sku || "",
            category: product.category,
            price: product.price.toString(),
            discountPrice: product.discountPrice?.toString() || "",
            stock: product.stock.toString(),
            videoUrl: product.videoUrl || "",
            images: product.images?.length > 0 ? product.images : [""]
        });
        setIsDialogOpen(true);
    };

    const addImageField = () => {
        setProductForm({ ...productForm, images: [...productForm.images, ""] });
    };

    const removeImageField = (index: number) => {
        const newImages = productForm.images.filter((_, i) => i !== index);
        setProductForm({ ...productForm, images: newImages.length > 0 ? newImages : [""] });
    };

    const updateImageField = (index: number, value: string) => {
        const newImages = [...productForm.images];
        newImages[index] = value;
        setProductForm({ ...productForm, images: newImages });
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku?.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = categoryFilter ? p.category === categoryFilter : true;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6 container mx-auto p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Products</h1>
                    <p className="text-gray-500">Add and manage your store products.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Payment Mode Toggle */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                        <Button
                            variant={paymentMode === "test" ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                                "rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                                paymentMode === "test" ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-slate-600"
                            )}
                            onClick={() => paymentMode !== "test" && togglePaymentMode()}
                            disabled={updatingMode || paymentMode === "loading"}
                        >
                            <ShieldAlert className="h-3 w-3 mr-1" /> Test Mode
                        </Button>
                        <Button
                            variant={paymentMode === "live" ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                                "rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                                paymentMode === "live" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-600"
                            )}
                            onClick={() => paymentMode !== "live" && togglePaymentMode()}
                            disabled={updatingMode || paymentMode === "loading"}
                        >
                            <ShieldCheck className="h-3 w-3 mr-1" /> Live Mode
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-slate-200" />

                    <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading} className="rounded-xl">
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="font-bold rounded-xl">
                                <Plus className="h-4 w-4 mr-2" /> Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-2 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase tracking-tight italic">
                                    {editingProduct ? "Edit Product" : "Add New <span className='text-primary NOT-italic'>Product</span>"}
                                </DialogTitle>
                            </DialogHeader>
                            {/* Form content exactly as before... */}
                            <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Product Name</label>
                                    <Input
                                        placeholder="e.g. Science Kit"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        placeholder="Tell us about the product..."
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Price (₹)</label>
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            value={productForm.price}
                                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Sell Price (₹)</label>
                                        <Input
                                            type="number"
                                            placeholder="800"
                                            value={productForm.discountPrice}
                                            onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Category</label>
                                        <Select
                                            value={productForm.category}
                                            onValueChange={(val) => setProductForm({ ...productForm, category: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => (
                                                    <SelectItem key={c._id} value={c.slug}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Stock</label>
                                        <Input
                                            type="number"
                                            placeholder="10"
                                            value={productForm.stock}
                                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Product Images (URLs)</label>
                                        <Button type="button" variant="outline" size="sm" onClick={addImageField} className="h-7 text-[10px] uppercase font-bold">
                                            + Add Image
                                        </Button>
                                    </div>
                                    {productForm.images.map((img, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="https://..."
                                                value={img}
                                                onChange={(e) => updateImageField(index, e.target.value)}
                                            />
                                            {productForm.images.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeImageField(index)} className="text-red-500">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">SKU ID (Optional)</label>
                                    <Input
                                        placeholder="EXP-001"
                                        value={productForm.sku}
                                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">YouTube Product Video Link (Optional)</label>
                                    <Input
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={productForm.videoUrl}
                                        onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })}
                                    />
                                </div>

                                <Button type="submit" className="w-full font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg shadow-primary/20">
                                    {editingProduct ? "Update Product" : "Launch Product"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search products..."
                    className="pl-12 h-14 rounded-2xl border-2 shadow-sm focus-visible:ring-primary/20 font-bold italic"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border-2 rounded-3xl overflow-hidden shadow-sm bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px] font-black uppercase text-[10px] tracking-widest pl-6">Image</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Category</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Price</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Stock</TableHead>
                            <TableHead className="text-right font-black uppercase text-[10px] tracking-widest pr-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing products...</p>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No products found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <TableCell className="pl-6">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border bg-white group-hover:scale-105 transition-transform duration-300">
                                            <img src={(product.images && product.images[0]) || product.image || 'https://placehold.co/100'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-sm uppercase tracking-tight">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize text-[10px] font-bold bg-slate-100/50 text-slate-600 border-none px-3 py-1 rounded-lg italic">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-black text-sm italic tracking-tight">₹{(product.discountPrice || product.price).toLocaleString()}</p>
                                        {product.discountPrice && (
                                            <p className="text-[10px] font-bold text-slate-400 line-through opacity-50">₹{product.price.toLocaleString()}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                                            product.stock < 5 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                        )}>
                                            {product.stock} Units
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:bg-white hover:text-primary hover:shadow-lg rounded-xl transition-all border border-slate-100 shadow-sm" onClick={() => handleEdit(product)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all border border-red-50 shadow-sm" onClick={() => handleDelete(product._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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

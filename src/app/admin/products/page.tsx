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
import { Plus, Search, Edit, Trash2, Loader2, RefreshCw, X } from "lucide-react";
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

    const [productForm, setProductForm] = useState({
        name: "",
        slug: "",
        description: "",
        sku: "",
        category: "",
        price: "",
        discountPrice: "",
        stock: "",
        images: [""] // Array for multiple images
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
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingProduct ? "PUT" : "POST";
        const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";

        // Filter out empty image URLs
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
                    image: validImages[0] || "" // Set first image as main image
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
            stock: "", images: [""]
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
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="font-bold">
                                <Plus className="h-4 w-4 mr-2" /> Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] rounded-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                            </DialogHeader>
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

                                <Button type="submit" className="w-full font-bold h-12">
                                    {editingProduct ? "Update Product" : "Submit Product"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search products..."
                    className="pl-10 h-12"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-xl overflow-x-auto shadow-sm bg-white">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <img src={product.image || product.images?.[0] || 'https://placehold.co/100'} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                                    </TableCell>
                                    <TableCell className="font-semibold text-sm">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize text-[10px] font-bold">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell className="font-bold">₹{product.discountPrice || product.price}</TableCell>
                                    <TableCell>
                                        <span className={cn(product.stock < 5 ? "text-red-500 font-bold" : "text-gray-600 font-medium")}>
                                            {product.stock}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => handleEdit(product)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(product._id)}>
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

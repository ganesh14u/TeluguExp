"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, RefreshCw, LayoutGrid, Edit } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setCategories(data);
        } catch (error: any) {
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingCategory ? "PUT" : "POST";
            const body = editingCategory
                ? { id: editingCategory._id, name, slug: name.toLowerCase().trim().replace(/\s+/g, '-') }
                : { name, slug: name.toLowerCase().trim().replace(/\s+/g, '-') };

            const res = await fetch("/api/categories", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            toast.success(editingCategory ? "Category updated!" : "Category added!");
            setIsDialogOpen(false);
            setName("");
            setEditingCategory(null);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will remove the category but not the products.")) return;
        try {
            const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success("Category deleted!");
            fetchCategories();
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const openEditDialog = (cat: any) => {
        setEditingCategory(cat);
        setName(cat.name);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-10 p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic pr-4">Product <span className="text-primary NOT-italic">Categories</span></h1>
                    <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2 italic opacity-70">Organize your products into categories.</p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" size="icon" onClick={fetchCategories} disabled={loading} className="rounded-2xl h-14 w-14 border-2 shadow-sm">
                        <RefreshCw className={`h-5 w-5 ${loading && "animate-spin"}`} />
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setEditingCategory(null);
                            setName("");
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                                <Plus className="h-5 w-5 mr-3" /> Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] border-4 p-10 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                                    {editingCategory ? "Update" : "Add"} <span className="text-primary NOT-italic">Category</span>
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateOrUpdate} className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Category Name</label>
                                    <Input
                                        placeholder="e.g. Electronics, Clothing"
                                        className="h-16 rounded-2xl border-2 text-lg font-bold px-6 focus-visible:ring-primary shadow-inner bg-muted/20"
                                        value={name}
                                        onChange={(e: any) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 italic">
                                    {editingCategory ? "Update Category" : "Save Category"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center bg-muted/10 rounded-[3rem] border-2 border-dashed">
                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                    <p className="mt-4 font-black uppercase tracking-[0.3em] text-[10px] text-muted-foreground animate-pulse">Loading...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center bg-muted/10 rounded-[3rem] border-2 border-dashed">
                    <LayoutGrid className="h-16 w-16 text-muted-foreground/20 mb-6" />
                    <p className="font-black uppercase tracking-widest text-xs text-muted-foreground opacity-50">No Categories Found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Card key={cat._id} className="rounded-[2.5rem] border-2 shadow-lg shadow-black/5 group hover:border-primary transition-all duration-500 overflow-hidden bg-white">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                                        <LayoutGrid className="h-7 w-7 text-primary group-hover:text-white transition-colors duration-500" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-black/5" onClick={() => openEditDialog(cat)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 text-red-500" onClick={() => handleDelete(cat._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors duration-500">{cat.name}</h3>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{cat.slug}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

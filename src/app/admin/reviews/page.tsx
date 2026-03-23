"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/reviews");
            const data = await res.json();
            if (!data.error) {
                setReviews(data);
            }
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleApprove = async (productId: string, reviewId: string) => {
        try {
            const res = await fetch(`/api/admin/reviews/${productId}/${reviewId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isApproved: true })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("Review approved successfully");
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (productId: string, reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            const res = await fetch(`/api/admin/reviews/${productId}/${reviewId}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("Review deleted successfully");
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-lg font-bold">Pending Reviews ({reviews.length})</h1>
                <p className="text-muted-foreground">Moderate customer feedback before it appears on the website.</p>
            </div>

            <div className="space-y-6">
                {reviews.map((review) => (
                    <Card key={review._id} className="group overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="grow space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-xs bg-slate-50">{review.productName}</Badge>
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted border-none"}`} />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 leading-relaxed italic">"{review.comment}"</p>
                                    <p className="font-bold text-sm">— {review.userName}</p>
                                </div>
                                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                    <Button size="sm" onClick={() => handleApprove(review.productId, review._id)} className="gap-2 rounded-full">
                                        <CheckCircle2 className="h-4 w-4" /> Approve
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(review.productId, review._id)} className="gap-2 rounded-full text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive">
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-3xl bg-muted/20">
                        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground font-bold">No pending reviews to moderate.</p>
                        <p className="text-xs text-slate-400 mt-2">All caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

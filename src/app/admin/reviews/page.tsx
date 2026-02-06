"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Trash2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const REVIEWS = [
    { id: 1, user: "Rahul S.", product: "DIY Solar Robot Kit", rating: 5, comment: "Amazing kit! My son loved building it and learning about solar energy.", date: "Just now" },
    { id: 2, user: "Anjali D.", product: "Newton's Cradle Deluxe", rating: 4, comment: "Looks Great on my desk, but the strings are a bit fragile.", date: "2 hours ago" },
    { id: 3, user: "Vikram R.", product: "Magnetic Levitation Pen", rating: 5, comment: "Physics is cool! Solid build quality.", date: "Yesterday" },
];

export default function AdminReviewsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Product Reviews</h1>
                <p className="text-muted-foreground">Moderate customer feedback.</p>
            </div>

            <div className="space-y-6">
                {REVIEWS.map((review) => (
                    <Card key={review.id} className="group overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="grow space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-xs">{review.product}</Badge>
                                        <span className="text-xs text-muted-foreground font-medium">{review.date}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted border-none"}`} />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                                    <p className="font-bold text-sm">— {review.user}</p>
                                </div>
                                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                    <Button size="sm" className="gap-2 rounded-full">
                                        <CheckCircle2 className="h-4 w-4" /> Approve
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 rounded-full text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center py-12 border-2 border-dashed rounded-3xl bg-muted/20">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No more reviews to moderate.</p>
            </div>
        </div>
    );
}

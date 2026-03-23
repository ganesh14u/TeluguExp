import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all products that have reviews
        const products = await Product.find({ "reviews": { $exists: true, $not: { $size: 0 } } })
            .select("name slug reviews")
            .lean();
        
        // Flatten reviews and add product details
        let allReviews: any[] = [];
        products.forEach((p: any) => {
            p.reviews.forEach((r: any) => {
                // Focus primarily on unapproved reviews for the dashboard
                if (!r.isApproved) {
                    allReviews.push({
                        _id: r._id,
                        productId: p._id,
                        productName: p.name,
                        productSlug: p.slug,
                        userId: r.userId,
                        userName: r.userName,
                        rating: r.rating,
                        comment: r.comment,
                        isApproved: r.isApproved,
                        createdAt: r.createdAt
                    });
                }
            });
        });

        // Sort descending by date
        allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(allReviews);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

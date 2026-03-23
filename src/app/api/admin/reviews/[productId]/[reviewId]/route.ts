import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ productId: string, reviewId: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId, reviewId } = await params;
        const body = await req.json();
        
        const product = await Product.findOneAndUpdate(
            { _id: productId, "reviews._id": reviewId },
            { $set: { "reviews.$.isApproved": body.isApproved } },
            { new: true }
        );

        if (!product) return NextResponse.json({ error: "Review or Product not found" }, { status: 404 });

        // Recalculate average rating if an approval is given
        if (body.isApproved) {
            const approvedReviews = product.reviews.filter((r: any) => r.isApproved);
            const totalRating = approvedReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
            product.ratings = approvedReviews.length > 0 ? (totalRating / approvedReviews.length).toFixed(1) : 0;
            product.numReviews = approvedReviews.length;
            await product.save();
        }

        return NextResponse.json({ message: "Review status updated successfully." });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ productId: string, reviewId: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId, reviewId } = await params;
        
        const product = await Product.findByIdAndUpdate(productId, {
            $pull: { reviews: { _id: reviewId } }
        }, { new: true });

        if (!product) return NextResponse.json({ error: "Review or Product not found" }, { status: 404 });

        // Auto recalculate after deletion if the review was approved before
        const approvedReviews = product.reviews.filter((r: any) => r.isApproved);
        const totalRating = approvedReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
        product.ratings = approvedReviews.length > 0 ? (totalRating / approvedReviews.length).toFixed(1) : 0;
        product.numReviews = approvedReviews.length;
        await product.save();

        return NextResponse.json({ message: "Review deleted successfully." });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

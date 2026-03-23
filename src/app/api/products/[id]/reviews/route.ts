import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { rating, comment } = await req.json();

        if (!rating || !comment) {
            return NextResponse.json({ error: "Rating and comment are required" }, { status: 400 });
        }

        let product;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findById(id);
        } else {
            product = await Product.findOne({ slug: id });
        }

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const newReview = {
            userId: (session.user as any).id,
            userName: session.user.name || "Anonymous",
            rating: Number(rating),
            comment,
            isApproved: false // Requires admin approval
        };

        product.reviews.push(newReview);
        await product.save();

        return NextResponse.json({ message: "Review submitted successfully and is pending admin approval." }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

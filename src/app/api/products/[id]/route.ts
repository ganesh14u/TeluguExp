import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        let product;

        // Try finding by ID first if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findById(id);
        }

        // If not found by ID or not a valid ID, try finding by slug
        if (!product) {
            product = await Product.findOne({ slug: id });
        }

        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        let product;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findByIdAndUpdate(id, body, { new: true });
        } else {
            product = await Product.findOneAndUpdate({ slug: id }, body, { new: true });
        }

        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        let product;

        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findByIdAndDelete(id);
        } else {
            product = await Product.findOneAndDelete({ slug: id });
        }

        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

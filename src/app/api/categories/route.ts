import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({}).sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const category = await Category.create(body);
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, ...updateData } = body;
        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
        if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
        return NextResponse.json(category);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const category = await Category.findByIdAndDelete(id);
        if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
        return NextResponse.json({ message: "Category deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

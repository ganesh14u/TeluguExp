import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const after = searchParams.get("after");

        let query: any = {};
        if (userId) query.userId = userId;
        if (after) query.createdAt = { $gt: new Date(after) };

        const orders = await Order.find(query).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const order = await Order.create(body);
        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, ...updateData } = body;
        const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const order = await Order.findByIdAndDelete(id);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        return NextResponse.json({ message: "Order deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

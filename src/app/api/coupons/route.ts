import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function GET() {
    try {
        await dbConnect();
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        return NextResponse.json(coupons);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const coupon = await Coupon.create(body);
        return NextResponse.json(coupon, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

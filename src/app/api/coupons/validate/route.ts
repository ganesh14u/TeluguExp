
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 });
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
        }

        return NextResponse.json(coupon);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

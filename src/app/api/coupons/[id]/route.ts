import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const coupon = await Coupon.findByIdAndDelete(params.id);
        if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        return NextResponse.json({ message: "Coupon deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

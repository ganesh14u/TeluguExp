import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function POST(req: Request) {
    try {
        const { amount } = await req.json();

        if (!amount) {
            return NextResponse.json({ error: "Amount is required" }, { status: 400 });
        }

        await dbConnect();
        const settings = await Settings.findOne({ key: "paymentMode" });
        const mode = settings?.value || "test";

        const isLive = mode === "live";
        const key_id = isLive ? process.env.RAZORPAY_KEY_ID : process.env.RAZORPAY_TEST_KEY_ID;
        const key_secret = isLive ? process.env.RAZORPAY_KEY_SECRET : process.env.RAZORPAY_TEST_KEY_SECRET;

        if (!key_id || !key_secret || key_id.includes("placeholder")) {
            return NextResponse.json({
                error: `Razorpay ${mode.toUpperCase()} keys are not configured correctly. Please update your .env.local with valid ${mode.toUpperCase()} keys.`
            }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: key_id,
            key_secret: key_secret,
        });

        const options = {
            amount: Math.round(amount * 100), // Razorpay accepts amount in paise
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Razorpay Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

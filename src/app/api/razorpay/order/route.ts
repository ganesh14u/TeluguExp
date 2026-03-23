import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function POST(req: Request) {
    try {
        const { amount, currency = "INR" } = await req.json();

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

        // Validate supported currencies, fallback to INR if not supported
        const supportedCurrencies = ["INR", "USD", "GBP", "AED"];
        const finalCurrency = supportedCurrencies.includes(currency) ? currency : "INR";

        // Provide multiplier: most currencies require amount in smallest subunit (e.g. cents -> * 100)
        let multiplier = 100;
        if (["BHD", "KWD", "OMR"].includes(finalCurrency)) {
            multiplier = 1000;
        }

        const options = {
            amount: Math.round(amount * multiplier), 
            currency: finalCurrency,
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Razorpay Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

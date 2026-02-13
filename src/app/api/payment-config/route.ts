import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET() {
    try {
        await dbConnect();
        const settings = await Settings.find({ key: { $in: ["paymentMode"] } });

        const settingsObj = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        const mode = settingsObj.paymentMode || "test";

        const isLive = mode === "live";
        let keyId = isLive ? process.env.RAZORPAY_KEY_ID : process.env.RAZORPAY_TEST_KEY_ID;

        // Fallback to Live only if Test is explicitly missing AND you want that behavior.
        // But user said "Test mode also working live mode", so I'll make it strict.
        if (!isLive && (!keyId || keyId.includes("placeholder"))) {
            keyId = process.env.RAZORPAY_TEST_KEY_ID || "rzp_test_placeholder";
        }

        return NextResponse.json({ mode, keyId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

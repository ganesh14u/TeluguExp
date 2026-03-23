import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use aggregation to accurately count the number of unapproved reviews
        const result = await Product.aggregate([
            { $unwind: "$reviews" },
            { $match: { "reviews.isApproved": false } },
            { $count: "count" }
        ]);

        const count = result.length > 0 ? result[0].count : 0;

        return NextResponse.json({ count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

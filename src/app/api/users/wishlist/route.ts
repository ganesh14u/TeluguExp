
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();

        const user = await User.findById(session.user.id).populate("wishlist");

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // User.wishlist is an array of populated Product documents
        const wishlistItems = user.wishlist.map((product: any) => {
            if (!product) return null;
            return product;
        }).filter((item: any) => item !== null);

        return NextResponse.json(wishlistItems);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { items } = await req.json();
        await dbConnect();

        // Expect items to be array of objects with _id
        const wishlistIds = items.map((item: any) => item._id);

        await User.findByIdAndUpdate(session.user.id, { wishlist: wishlistIds });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

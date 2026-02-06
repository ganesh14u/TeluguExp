
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product"; // Ensure Product model is registered

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();

        // Ensure Product model is initialized to avoid MissingSchemaError if not yet used
        // We're importing it, so it should be fine.

        const user = await User.findById(session.user.id).populate("cart.productId");

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const cartItems = user.cart.map((item: any) => {
            // Check if productId is populated (it might differ if product deleted)
            if (!item.productId) return null;

            return {
                _id: item.productId._id.toString(),
                name: item.name,
                slug: item.productId.slug,
                price: item.price,
                discountPrice: item.discountPrice,
                image: item.image,
                quantity: item.quantity
            };
        }).filter((item: any) => item !== null);

        return NextResponse.json(cartItems);
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

        const dbCartItems = items.map((item: any) => ({
            productId: item._id,
            name: item.name,
            image: item.image,
            price: item.price,
            discountPrice: item.discountPrice,
            quantity: item.quantity
        }));

        await User.findByIdAndUpdate(session.user.id, { cart: dbCartItems });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const SAMPLE_PRODUCTS = [
    {
        name: "DIY Solar Robot Kit",
        slug: "diy-solar-robot",
        description: "Build your own solar-powered robot with this 14-in-1 educational kit. Perfect for learning about renewable energy.",
        price: 1299,
        discountPrice: 899,
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
        images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"],
        category: "experiments",
        stock: 50,
        ratings: 4.8,
        numReviews: 124,
        isFeatured: true,
        sku: "TEL-SOL-001"
    },
    {
        name: "Magnetic Levitation Pen",
        slug: "mag-lev-pen",
        description: "A pen that floats in mid-air using magnetic levitation. A great desk gadget and physics demonstration.",
        price: 799,
        discountPrice: 499,
        image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=400",
        images: ["https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=400"],
        category: "gadgets",
        stock: 35,
        ratings: 4.5,
        numReviews: 89,
        isFeatured: true,
        sku: "TEL-MAG-002"
    },
    {
        name: "Newton's Cradle Deluxe",
        slug: "newtons-cradle",
        description: "Classic desk toy that demonstrates the laws of conservation of momentum and energy.",
        price: 1599,
        discountPrice: 1199,
        image: "https://images.unsplash.com/photo-1591123720164-de1348028a38?auto=format&fit=crop&q=80&w=400",
        images: ["https://images.unsplash.com/photo-1591123720164-de1348028a38?auto=format&fit=crop&q=80&w=400"],
        category: "gadgets",
        stock: 20,
        ratings: 4.7,
        numReviews: 56,
        isFeatured: true,
        sku: "TEL-NEW-003"
    }
];

export async function GET() {
    try {
        await dbConnect();

        // Check if data already exists to avoid duplication
        const productCount = await Product.countDocuments();
        if (productCount > 0) {
            return NextResponse.json({ message: "Database already has data. Seed skipped." });
        }

        await Product.insertMany(SAMPLE_PRODUCTS);

        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Admin Ganesh",
            email: "admin@teluguexperiments.com",
            password: hashedPassword,
            role: "admin"
        });

        return NextResponse.json({ message: "Database seeded successfully! 🚀" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

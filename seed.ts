import dbConnect from "./src/lib/mongodb";
import Product from "./src/models/Product";
import User from "./src/models/User";
import Order from "./src/models/Order";
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

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await dbConnect();

        console.log("Cleaning up existing data...");
        await Product.deleteMany({});
        await User.deleteMany({});

        console.log("Seeding products...");
        await Product.insertMany(SAMPLE_PRODUCTS);

        console.log("Creating admin user...");
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Admin Ganesh",
            email: "admin@teluguexperiments.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log("Database seeded successfully! 🚀");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seed();

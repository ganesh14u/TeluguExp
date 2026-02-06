import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();

        const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments(),
            Order.find({ isPaid: true }).select("totalPrice")
        ]);

        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        // Get recent orders (last 5)
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5);

        // Get sales data for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for chart (fill in missing days)
        const salesData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const dayData = salesStats.find(s => s._id === dateStr);
            salesData.push({
                name: dayName,
                sales: dayData ? dayData.sales : 0,
                orders: dayData ? dayData.orders : 0
            });
        }

        return NextResponse.json({
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
                totalRevenue,
            },
            recentOrders,
            salesData
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

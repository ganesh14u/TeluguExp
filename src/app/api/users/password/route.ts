import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { currentPassword, newPassword } = await req.json();
        const user = await User.findById(session.user.id);

        if (!user.password) {
            // Social login user might not have a password set initially
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            return NextResponse.json({ message: "Password set successfully" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

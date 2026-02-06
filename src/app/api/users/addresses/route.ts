import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const address = await req.json();
        const user = await User.findById(session.user.id);

        if (address.isDefault) {
            user.addresses.forEach((a: any) => a.isDefault = false);
        }

        user.addresses.push(address);
        await user.save();

        return NextResponse.json(user.addresses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { addressId, ...updatedAddress } = await req.json();
        const user = await User.findById(session.user.id);

        if (updatedAddress.isDefault) {
            user.addresses.forEach((a: any) => a.isDefault = false);
        }

        const addressIndex = user.addresses.findIndex((a: any) => a._id.toString() === addressId);
        if (addressIndex === -1) return NextResponse.json({ error: "Address not found" }, { status: 404 });

        user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updatedAddress };
        await user.save();

        return NextResponse.json(user.addresses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const addressId = searchParams.get("addressId");

        const user = await User.findById(session.user.id);
        user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId);
        await user.save();

        return NextResponse.json(user.addresses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

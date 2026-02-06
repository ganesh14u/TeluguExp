import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CMS from "@/models/CMS";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    try {
        await dbConnect();
        if (key) {
            const data = await CMS.findOne({ key });
            return NextResponse.json(data);
        }
        const all = await CMS.find({});
        return NextResponse.json(all);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { key, content } = body;
        const cms = await CMS.findOneAndUpdate(
            { key },
            { content },
            { upsert: true, new: true }
        );
        return NextResponse.json(cms);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

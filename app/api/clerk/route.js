import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        console.log("🔹 Clerk Webhook received at /api/clerk");

        // Parse request body
        const payload = await req.json();
        console.log("🔹 Raw Payload:", payload);

        // Extract headers
        const headers = Object.fromEntries(req.headers);
        console.log("🔹 Headers:", headers);

        // Extract Svix headers
        const svixHeaders = {
            "svix-id": headers["svix-id"],
            "svix-timestamp": headers["svix-timestamp"],
            "svix-signature": headers["svix-signature"],
        };

        console.log("🔹 Svix Headers:", svixHeaders);

        // Verify Signature
        const wh = new Webhook(process.env.SIGNING_SECRET);
        const { data, type } = wh.verify(JSON.stringify(payload), svixHeaders);
        console.log(`✅ Verified event: ${type}`);

        // Connect to MongoDB
        await connectDB();

        // Prepare user data
        const userData = {
            _id: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            image: data.image_url || "",
        };

        switch (type) {
            case "user.created":
                await User.create(userData);
                console.log(`✅ User created: ${userData.email}`);
                break;
            case "user.updated":
                await User.findByIdAndUpdate(data.id, userData);
                console.log(`✅ User updated: ${userData.email}`);
                break;
            case "user.deleted":
                await User.findByIdAndDelete(data.id);
                console.log(`✅ User deleted: ${data.id}`);
                break;
            default:
                console.log(`ℹ️ Unhandled event type: ${type}`);
        }

        return NextResponse.json({ message: "Webhook processed successfully" });
    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
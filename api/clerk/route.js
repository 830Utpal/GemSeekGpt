import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        if (!process.env.SIGNING_SECRET) {
            throw new Error("SIGNING_SECRET is missing in environment variables");
        }

        // Initialize Webhook with secret key
        const wh = new Webhook(process.env.SIGNING_SECRET);

        // Retrieve headers (No need for `await`)
        const headerPayload = headers();
        const svixHeaders = {
            "svix-id": headerPayload.get("svix-id"),
            "svix-timestamp": headerPayload.get("svix-timestamp"),
            "svix-signature": headerPayload.get("svix-signature"),
        };

        if (!svixHeaders["svix-id"] || !svixHeaders["svix-timestamp"] || !svixHeaders["svix-signature"]) {
            return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
        }

        // Get the payload and verify it
        const payload = await req.json();
        const body = JSON.stringify(payload);
        const { data, type } = wh.verify(body, svixHeaders);

        // Prepare user data to save
        const userData = {
            _id: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            image: data.image_url || "",
        };

        // Connect to the database
        await connectDB();

        // Handle different event types
        switch (type) {
            case "user.created":
                await User.create(userData);
                console.log(`✅ User created: ${userData.email}`);
                break;
            case "user.updated":
                await User.findByIdAndUpdate(data.id, userData, { new: true });
                console.log(`✅ User updated: ${userData.email}`);
                break;
            case "user.deleted":
                await User.findByIdAndDelete(data.id);
                console.log(`✅ User deleted: ${data.id}`);
                break;
            default:
                console.warn(`⚠️ Unhandled event type: ${type}`);
                break;
        }

        return NextResponse.json({ message: "Event received" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error processing webhook:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

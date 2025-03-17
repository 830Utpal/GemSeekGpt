import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Initialize the Svix webhook
        const wh = new Webhook(process.env.SIGNING_SECRET);

        // Get headers
        const headerPayload = headers();
        const svixHeaders = {
            "svix-id": headerPayload.get("svix-id"),
            "svix-timestamp": headerPayload.get("svix-timestamp"),
            "svix-signature": headerPayload.get("svix-signature"),
        };

        // Get and verify payload
        const payload = await req.json();
        const body = JSON.stringify(payload);
        const data = wh.verify(body, svixHeaders); // `data` contains the user info

        // Get event type
        const { type } = payload; // Extract type from payload

        // Prepare user data
        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address, // FIXED
            name: `${data.first_name} ${data.last_name}`,
            image: data.image_url,
        };

        // Connect to DB
        await connectDB();

        // Handle events
        switch (type) {
            case "user.created":
                await User.create(userData);
                break;
            case "user.updated":
                await User.findByIdAndUpdate(data.id, userData);
                break;
            case "user.deleted":
                await User.findByIdAndDelete(data.id);
                break;
            default:
                console.log(`Unhandled event type: ${type}`);
        }

        return NextResponse.json({ message: "Event received successfully" });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}

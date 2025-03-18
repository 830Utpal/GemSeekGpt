import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

export async function GET(req){
    try{
       const {userId} =getAuth(req);

       if(!userId){
        return NextResponse.json({
            success:false,
            message:"user not authenticated",
        });
       }
       //CONNECT TO THE DATABASE and fetch all the chats of the user
       await connectDB()
       const data=await Chat.find({userId});

       return NextResponse.json({success:true,data})
    }catch(error){
        return NextResponse.json({success:false,error:error.message});
    }
}
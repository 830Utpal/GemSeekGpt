import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

export async function POST(req){
    try{
        const {userId} =getAuth(req);

        if(!userId){
            return NextResponse.json({
                success:false,
                message:"User not authenticated"
            });
        }

        const {chatId,name}=await req.json();
        //coonnect to db and add the chat name

        await Chat.findOneAndUpdate({_id:chatId,userId},{name})

        return NextResponse.json({success:true,message:"Chat removed"});

    }catch(error){
       return NextResponse.json({success:false,error:error.message})
    }
}
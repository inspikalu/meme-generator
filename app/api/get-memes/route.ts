// app/api/get-memes/route.ts
import { NextRequest } from "next/server";
import { memeApiBaseUrl } from "@/app/utils/constants";

export async function GET(request: NextRequest) {
    const response = await fetch(`${memeApiBaseUrl}/get_memes`);
    const data = await response.json(); // Ensure you await the response.json()

    return Response.json({ data });
}

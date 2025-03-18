import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export function GET(req: NextRequest) {
  // Verify that required environment variables are set
  if (!process.env.WORLD_APP_ID) {
    return NextResponse.json(
      { error: "World App ID not configured on the server" },
      { status: 500 }
    )
  }

  // Generate a secure nonce - at least 8 alphanumeric characters
  const nonce = crypto.randomUUID().replace(/-/g, "")

  // Store the nonce in cookies so we can verify it later
  cookies().set("siwe", nonce, { 
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    path: "/"
  })
  
  return NextResponse.json({ 
    nonce,
    appId: process.env.WORLD_APP_ID
  })
} 
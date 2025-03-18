import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export function GET(req: NextRequest) {
  // Set app ID from environment variable or use default
  const appId = process.env.WORLD_APP_ID || "app_a694eef5223a11d38b4f737fad00e561"
  
  // Generate a secure nonce using UUID
  const nonce = crypto.randomUUID().replace(/-/g, "")
  console.log("Generated nonce:", nonce)

  // Create the response with the nonce and appId
  const response = NextResponse.json({ 
    nonce,
    appId
  })
  
  // Set the cookie in the response
  response.cookies.set("siwe", nonce, { 
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    path: "/"
  })
  
  return response
} 
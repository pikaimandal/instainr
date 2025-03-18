import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from "@worldcoin/minikit-js"

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
  appId: string
}

export async function POST(req: NextRequest) {
  // Verify that required environment variables are set
  if (!process.env.WORLD_APP_ID) {
    return NextResponse.json(
      { error: "World App ID not configured on the server" },
      { status: 500 }
    )
  }

  const { payload, nonce, appId } = (await req.json()) as IRequestPayload
  
  // Verify the app ID matches our configured app ID
  if (appId !== process.env.WORLD_APP_ID) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid app ID",
    })
  }
  
  // Verify the nonce matches what we stored
  if (nonce !== cookies().get("siwe")?.value) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid nonce",
    })
  }
  
  try {
    // Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce)
    
    if (validMessage.isValid) {
      // In a real app, you would create or fetch the user in your database here
      // using the verified wallet address
      
      // Clear the nonce cookie as it's no longer needed
      cookies().delete("siwe")
      
      return NextResponse.json({
        status: "success",
        isValid: true,
        address: payload.address
      })
    } else {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid signature",
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message || "Verification failed",
    })
  }
} 
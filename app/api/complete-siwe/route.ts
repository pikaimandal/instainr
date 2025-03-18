import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// Add mock verification for testing since we don't have the actual verification library
function mockVerifySiweMessage(payload: any, nonce: string) {
  console.log("Verifying SIWE message:", { payload, nonce })
  // For testing, always return valid if the payload status is success
  return Promise.resolve({
    isValid: payload.status === 'success',
    address: payload.address
  })
}

interface IRequestPayload {
  payload: {
    status: 'success' | 'error';
    message?: string;
    signature?: string;
    address?: string;
    version?: number;
  };
  nonce: string;
  appId: string;
}

export async function POST(req: NextRequest) {
  // Set app ID from environment variable or use default
  const appId = process.env.WORLD_APP_ID || "app_a694eef5223a11d38b4f737fad00e561"
  
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload
    console.log("Received verification request:", { payload, nonce })
    
    // Get the stored nonce from cookies
    const storedNonce = req.cookies.get("siwe")?.value
    console.log("Stored nonce:", storedNonce)
    
    if (nonce !== storedNonce) {
      console.error("Invalid nonce:", { provided: nonce, stored: storedNonce })
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid nonce",
      })
    }
    
    try {
      // Use mock verification for now
      const validMessage = await mockVerifySiweMessage(payload, nonce)
      console.log("Verification result:", validMessage)
      
      if (validMessage.isValid) {
        // Create response with success result
        const response = NextResponse.json({
          status: "success",
          isValid: true,
          address: payload.address
        })
        
        // Clear the nonce cookie as it's no longer needed
        response.cookies.delete("siwe")
        
        return response
      } else {
        return NextResponse.json({
          status: "error",
          isValid: false,
          message: "Invalid signature",
        })
      }
    } catch (error: any) {
      console.error("Verification error:", error)
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: error.message || "Verification failed",
      })
    }
  } catch (error: any) {
    console.error("Request processing error:", error)
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid request format",
    })
  }
} 
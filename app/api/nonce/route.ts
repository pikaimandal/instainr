import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Expects only alphanumeric characters - must be at least 8 characters
  const nonce = crypto.randomUUID().replace(/-/g, "")

  // The nonce should be stored somewhere that is not tamperable by the client
  // Optionally you can HMAC the nonce with a secret key stored in your environment
  cookies().set("siwe", nonce, { secure: true })
  
  return NextResponse.json({ nonce })
}
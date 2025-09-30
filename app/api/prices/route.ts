import { NextResponse } from "next/server"

export async function GET() {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=worldcoin-wld,ethereum,usd-coin&vs_currencies=inr"
    const r = await fetch(url, { next: { revalidate: 60 } })
    const j = await r.json()

    const data = {
      WLD: Number(j?.["worldcoin-wld"]?.inr ?? 0),
      ETH: Number(j?.ethereum?.inr ?? 0),
      "USDC.e": Number(j?.["usd-coin"]?.inr ?? 0),
    }

    return NextResponse.json(data)
  } catch (e) {
    // Fallback zeros on error
    return NextResponse.json({ WLD: 0, ETH: 0, "USDC.e": 0 })
  }
}

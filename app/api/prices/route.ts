import { NextResponse } from "next/server"

export async function GET() {
  try {
    // CoinGecko free tier API endpoint with proper coin IDs
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=worldcoin-wld,ethereum,usd-coin&vs_currencies=inr"
    
    const response = await fetch(url, { 
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        'Accept': 'application/json',
      }
    })

    // Handle rate limiting and API errors
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      
      // Return cached data or throw error for production
      throw new Error(`CoinGecko API returned ${response.status}`)
    }

    const data = await response.json()
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from CoinGecko API')
    }

    // Extract prices with proper validation
    const prices = {
      WLD: data["worldcoin-wld"]?.inr || 0,
      ETH: data["ethereum"]?.inr || 0,
      "USDC.e": data["usd-coin"]?.inr || 0,
    }

    // Validate that we got actual price data
    const hasValidPrices = Object.values(prices).some(price => price > 0)
    if (!hasValidPrices) {
      console.warn('CoinGecko API returned zero prices for all tokens')
    }

    // Log current prices for monitoring
    console.log(`Price update: WLD=₹${prices.WLD}, ETH=₹${prices.ETH}, USDC=₹${prices["USDC.e"]}`)

    return NextResponse.json(prices)
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error)
    
    // For production: Don't return fallback zeros as requested
    // Instead return an error that can be handled by the frontend
    return NextResponse.json(
      { 
        error: 'Failed to fetch current prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

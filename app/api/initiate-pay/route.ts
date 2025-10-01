import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

interface InitiatePayRequest {
  token: 'WLD' | 'USDC.e'
  amount: string // token amount (e.g., "1.5")
  methodSummary: string // payment method description
}

// In a real app, store this in a database
const pendingPayments = new Map<string, {
  referenceId: string
  token: 'WLD' | 'USDC.e'
  amount: string
  to: string
  methodSummary: string
  createdAt: number
}>()

export async function POST(req: NextRequest) {
  try {
    const body: InitiatePayRequest = await req.json()
    const { token, amount, methodSummary } = body

    // Validate inputs
    if (!token || !amount || !methodSummary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['WLD', 'USDC.e'].includes(token)) {
      return NextResponse.json({ error: 'Invalid token. Only WLD and USDC.e are supported' }, { status: 400 })
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Generate unique reference ID
    const referenceId = `instainr_${Date.now()}_${randomBytes(8).toString('hex')}`
    
    // Whitelisted recipient address
    const to = '0x06A4A1eA929074790E4E4bE3d8be70d4E4738CC6'

    // Store payment operation (in production, use a database)
    pendingPayments.set(referenceId, {
      referenceId,
      token,
      amount,
      to,
      methodSummary,
      createdAt: Date.now()
    })

    // Convert amount to appropriate units for MiniKit Pay
    // WLD uses 18 decimals, USDC.e uses 6 decimals
    const decimals = token === 'WLD' ? 18 : 6
    const amountInUnits = (amountNum * Math.pow(10, decimals)).toString()

    return NextResponse.json({
      referenceId,
      to,
      tokens: [
        {
          symbol: token,
          token_amount: amountInUnits
        }
      ]
    })

  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Export the pending payments for verification endpoint
export { pendingPayments }
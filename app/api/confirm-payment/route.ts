import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface ConfirmPaymentRequest {
  payload: MiniAppPaymentSuccessPayload
}

interface ConfirmPaymentResponse {
  success: boolean
  transactionId?: string
  reference?: string
  status?: string
  explorerUrl?: string
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ConfirmPaymentRequest = await req.json()
    const { payload } = body

    if (!payload || !payload.reference) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid payload or missing reference' 
      }, { status: 400 })
    }

    const { reference } = payload

    // Import pendingPayments from the initiate-pay route
    const { pendingPayments } = await import('../initiate-pay/route')
    
    // Verify this payment was initiated by us
    const pendingPayment = pendingPayments.get(reference)
    if (!pendingPayment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment reference not found' 
      }, { status: 404 })
    }

    // Query Developer Portal API to get payment status
    const developerPortalUrl = `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.NEXT_PUBLIC_WLD_APP_ID}&type=payment`
    
    try {
      const response = await fetch(developerPortalUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.WLD_DEVELOPER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Developer Portal API error:', response.status, await response.text())
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to verify payment with Developer Portal' 
        }, { status: 500 })
      }

      const transactionData = await response.json()
      
      // Check if payment is successful
      const isSuccessful = transactionData.status === 'mined' || transactionData.status === 'confirmed'
      
      if (isSuccessful) {
        // Remove from pending payments
        pendingPayments.delete(reference)
        
        // Generate explorer URL (World Chain Mainnet)
        const explorerUrl = `https://worldscan.org/tx/${transactionData.transaction_hash}`
        
        return NextResponse.json({
          success: true,
          transactionId: payload.transaction_id,
          reference: reference,
          status: transactionData.status,
          explorerUrl: explorerUrl
        })
      } else {
        return NextResponse.json({
          success: false,
          transactionId: payload.transaction_id,
          reference: reference,
          status: transactionData.status,
          error: 'Payment not yet confirmed'
        })
      }

    } catch (apiError) {
      console.error('Error calling Developer Portal API:', apiError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to verify payment status' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
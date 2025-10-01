import { NextRequest, NextResponse } from 'next/server'
import { fetchAllTokenBalances } from '@/lib/blockchain'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  
  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 })
  }
  
  try {
    console.log('🧪 Testing balance fetch for address:', address)
    const balances = await fetchAllTokenBalances(address)
    console.log('🧪 Test result:', balances)
    
    return NextResponse.json({
      success: true,
      address,
      balances,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('🧪 Test failed:', error)
    return NextResponse.json({
      success: false,
      address,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
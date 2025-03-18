import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    // Generate a random nonce
    const nonce = randomBytes(32).toString('hex');
    
    // Return the nonce and app ID
    return NextResponse.json({
      nonce,
      appId: process.env.NEXT_PUBLIC_WLD_APP_ID || "app_a694eef5223a11d38b4f737fad00e561"
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
} 
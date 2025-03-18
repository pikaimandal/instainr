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

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { payload, nonce, appId } = body;
    
    // In a real implementation, you would verify the SIWE message and signature
    // For this demo, we'll just validate that we received the required fields
    if (!payload || !nonce || !appId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Log the verification attempt
    console.log('SIWE verification attempt:', {
      address: payload.address,
      nonce,
      appId,
    });
    
    // For demo purposes, always return success
    return NextResponse.json({
      isValid: true,
      address: payload.address,
    });
  } catch (error) {
    console.error('Error verifying SIWE payload:', error);
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 500 }
    );
  }
} 
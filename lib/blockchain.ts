import { formatUnits } from 'viem'

// World Chain Mainnet configuration with Alchemy
export const WORLD_CHAIN_CONFIG = {
  chainId: 480,
  alchemyUrl: `https://worldchain-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  name: 'World Chain',
}

// Token contract addresses on World Chain
export const TOKEN_CONTRACTS = {
  WLD: '0x2cfc85d8e48f8eab294be644d9e25c3030863003',
  'USDC.e': '0x79a02482a880bce3f13e09da970dc34db4cd24d1',
  ETH: '0x4200000000000000000000000000000000000006', // WETH on World Chain
} as const

// Token decimals
export const TOKEN_DECIMALS = {
  WLD: 18,
  'USDC.e': 6,
  ETH: 18,
} as const

/**
 * Makes an RPC call to Alchemy's World Chain endpoint
 * @param method - The RPC method to call
 * @param params - The parameters for the RPC call
 * @returns The response from the RPC call
 */
async function makeAlchemyCall(method: string, params: any[]): Promise<any> {
  console.log(`🌐 Making Alchemy API call:`, {
    method,
    params,
    url: WORLD_CHAIN_CONFIG.alchemyUrl
  })
  
  // Check if API key is available
  if (!process.env.ALCHEMY_API_KEY) {
    console.error('❌ ALCHEMY_API_KEY is not set in environment variables')
    throw new Error('ALCHEMY_API_KEY is not configured')
  }
  
  const requestBody = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  }
  
  console.log('📦 Request body:', JSON.stringify(requestBody, null, 2))
  
  try {
    const response = await fetch(WORLD_CHAIN_CONFIG.alchemyUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log(`📨 Alchemy API response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Alchemy API HTTP error response:', errorText)
      throw new Error(`Alchemy API call failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📨 Alchemy API response data:', JSON.stringify(data, null, 2))
    
    if (data.error) {
      console.error('❌ Alchemy API returned error:', data.error)
      throw new Error(`Alchemy API error: ${data.error.message} (${data.error.code})`)
    }

    console.log('✅ Alchemy API call successful, returning result')
    return data.result
  } catch (error) {
    console.error('❌ Alchemy API call failed with exception:', error)
    throw error
  }
}

/**
 * Fetches native ETH balance for a wallet address
 * @param walletAddress - The wallet address to check
 * @returns The formatted ETH balance as a string
 */
async function fetchNativeETHBalance(walletAddress: string): Promise<string> {
  console.log(`💎 Fetching native ETH balance for: ${walletAddress}`)
  try {
    const balance = await makeAlchemyCall('eth_getBalance', [walletAddress, 'latest'])
    console.log(`💎 Raw ETH balance response: ${balance}`)
    
    const formattedBalance = formatUnits(BigInt(balance), 18)
    const finalBalance = parseFloat(formattedBalance).toFixed(6)
    
    console.log(`✅ ETH balance formatted: ${formattedBalance} -> ${finalBalance}`)
    return finalBalance
  } catch (error) {
    console.error('❌ Error fetching native ETH balance:', error)
    return '0.000000'
  }
}

/**
 * Fetches ERC20 token balances using Alchemy's optimized method
 * @param walletAddress - The wallet address to check
 * @returns Object containing token balances
 */
async function fetchERC20Balances(walletAddress: string): Promise<{
  WLD: string
  'USDC.e': string
}> {
  console.log(`🪙 Fetching ERC20 token balances for: ${walletAddress}`)
  console.log('🔍 Target token contracts:', TOKEN_CONTRACTS)
  
  try {
    // Use Alchemy's alchemy_getTokenBalances method for better performance
    console.log('🚀 Calling alchemy_getTokenBalances...')
    const tokenBalances = await makeAlchemyCall('alchemy_getTokenBalances', [
      walletAddress,
      'erc20'
    ])

    console.log('📦 Alchemy token balances full response:', JSON.stringify(tokenBalances, null, 2))

    const balances = {
      WLD: '0.000000',
      'USDC.e': '0.000000',
    }

    if (tokenBalances && tokenBalances.tokenBalances) {
      console.log(`🔍 Processing ${tokenBalances.tokenBalances.length} token balances...`)
      
      for (const token of tokenBalances.tokenBalances) {
        const contractAddress = token.contractAddress?.toLowerCase()
        console.log(`🔍 Checking token:`, {
          contractAddress,
          tokenBalance: token.tokenBalance,
          error: token.error
        })
        
        if (contractAddress === TOKEN_CONTRACTS.WLD.toLowerCase()) {
          console.log('✅ Found WLD token!')
          if (token.tokenBalance && token.tokenBalance !== '0x0') {
            const balance = formatUnits(BigInt(token.tokenBalance), TOKEN_DECIMALS.WLD)
            balances.WLD = parseFloat(balance).toFixed(6)
            console.log(`✅ WLD balance: ${token.tokenBalance} -> ${balance} -> ${balances.WLD}`)
          } else {
            console.log('🟡 WLD balance is zero or empty')
          }
        } else if (contractAddress === TOKEN_CONTRACTS['USDC.e'].toLowerCase()) {
          console.log('✅ Found USDC.e token!')
          if (token.tokenBalance && token.tokenBalance !== '0x0') {
            const balance = formatUnits(BigInt(token.tokenBalance), TOKEN_DECIMALS['USDC.e'])
            balances['USDC.e'] = parseFloat(balance).toFixed(6)
            console.log(`✅ USDC.e balance: ${token.tokenBalance} -> ${balance} -> ${balances['USDC.e']}`)
          } else {
            console.log('🟡 USDC.e balance is zero or empty')
          }
        } else {
          console.log(`⚠️ Unknown token contract: ${contractAddress}`)
        }
      }
    } else {
      console.log('⚠️ No tokenBalances found in response')
    }

    console.log('✅ Final ERC20 balances:', balances)
    return balances
  } catch (error) {
    console.error('❌ Error fetching ERC20 balances:', error)
    return {
      WLD: '0.000000',
      'USDC.e': '0.000000',
    }
  }
}

/**
 * Fetches all token balances for a wallet address using Alchemy's optimized APIs
 * @param walletAddress - The wallet address to check
 * @returns Object containing all token balances
 */
export async function fetchAllTokenBalances(walletAddress: string): Promise<{
  WLD: string
  'USDC.e': string
  ETH: string
}> {
  console.log('=== STARTING TOKEN BALANCE FETCH ===')
  console.log(`👛 Target wallet address: ${walletAddress}`)
  console.log('🌐 World Chain config:', {
    chainId: WORLD_CHAIN_CONFIG.chainId,
    hasApiKey: !!process.env.ALCHEMY_API_KEY,
    apiKeyLength: process.env.ALCHEMY_API_KEY?.length || 0
  })
  
  try {
    console.log('🚀 Starting parallel fetch of ETH and ERC20 balances...')
    
    // Fetch native ETH and ERC20 tokens in parallel
    const [ethBalance, erc20Balances] = await Promise.all([
      fetchNativeETHBalance(walletAddress),
      fetchERC20Balances(walletAddress),
    ])

    console.log('✅ Both balance fetches completed!')
    console.log('ETH balance result:', ethBalance)
    console.log('ERC20 balances result:', erc20Balances)

    const result = {
      WLD: erc20Balances.WLD,
      'USDC.e': erc20Balances['USDC.e'],
      ETH: ethBalance,
    }

    console.log('🎉 FINAL BALANCE RESULT:', result)
    console.log('=== TOKEN BALANCE FETCH COMPLETE ===')
    return result
  } catch (error) {
    console.error('❌ ERROR IN fetchAllTokenBalances:', error)
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    console.log('=== TOKEN BALANCE FETCH FAILED ===')
    throw error // Re-throw to let the hook handle the error properly
  }
}

/**
 * Validates if an address is a valid Ethereum address
 * @param address - The address to validate
 * @returns True if the address is valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
import { formatUnits } from 'viem'

// World Chain Mainnet configuration with Alchemy
// Using Alchemy's official public key for World Chain access
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || 'DDZkZIn3f3YcPrU6LGeP9jzGu7FQZfoA'

export const WORLD_CHAIN_CONFIG = {
  chainId: 480,
  alchemyUrl: `https://worldchain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
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
  console.log(`🌐 Calling ${method} with params:`, JSON.stringify(params))
  
  const response = await fetch(WORLD_CHAIN_CONFIG.alchemyUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  })

  if (!response.ok) {
    throw new Error(`Alchemy API failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log(`✅ ${method} response:`, JSON.stringify(data))
  
  if (data.error) {
    console.error(`❌ Alchemy API error for ${method}:`, data.error)
    throw new Error(`Alchemy error: ${data.error.message}`)
  }

  return data.result
}

/**
 * Fetches native ETH balance for a wallet address
 * @param walletAddress - The wallet address to check
 * @returns The formatted ETH balance as a string
 */
async function fetchNativeETHBalance(walletAddress: string): Promise<string> {
  try {
    const balance = await makeAlchemyCall('eth_getBalance', [walletAddress, 'latest'])
    const balanceBigInt = BigInt(balance)
    
    let formattedBalance: string
    try {
      formattedBalance = formatUnits(balanceBigInt, 18)
    } catch (error) {
      console.error('formatUnits failed for ETH, using manual calculation:', error)
      formattedBalance = (Number(balanceBigInt) / Math.pow(10, 18)).toString()
    }
    
    const finalBalance = parseFloat(formattedBalance).toFixed(6)
    return finalBalance
  } catch (error) {
    console.error('❌ ETH balance error:', error)
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
  try {
    const tokenBalances = await makeAlchemyCall('alchemy_getTokenBalances', [
      walletAddress,
      'erc20'
    ])

    const balances = {
      WLD: '0.000000',
      'USDC.e': '0.000000',
    }

    if (tokenBalances?.tokenBalances) {
      for (const token of tokenBalances.tokenBalances) {
        const contractAddress = token.contractAddress?.toLowerCase()
        
        if (contractAddress === TOKEN_CONTRACTS.WLD.toLowerCase() && token.tokenBalance && token.tokenBalance !== '0x0') {
          try {
            const balanceBigInt = BigInt(token.tokenBalance)
            console.log('🔍 WLD Raw balance:', token.tokenBalance, 'BigInt:', balanceBigInt.toString())
            
            // Use manual calculation as primary method for reliability
            const manualBalance = (Number(balanceBigInt) / Math.pow(10, TOKEN_DECIMALS.WLD)).toFixed(6)
            console.log('🔍 WLD Manual calculation:', manualBalance)
            
            // Try viem formatUnits as backup verification
            let viemBalance = '0.000000'
            try {
              const viemResult = formatUnits(balanceBigInt, TOKEN_DECIMALS.WLD)
              viemBalance = parseFloat(viemResult).toFixed(6)
              console.log('🔍 WLD Viem result:', viemBalance)
            } catch (viemError) {
              console.warn('🔍 WLD Viem formatUnits failed, using manual calculation:', viemError)
            }
            
            // Use manual calculation (more reliable)
            balances.WLD = manualBalance
            console.log('✅ WLD Final balance:', balances.WLD)
            
          } catch (error) {
            console.error('❌ WLD balance parsing error:', error)
            balances.WLD = '0.000000'
          }
        } else if (contractAddress === TOKEN_CONTRACTS['USDC.e'].toLowerCase() && token.tokenBalance && token.tokenBalance !== '0x0') {
          try {
            const balanceBigInt = BigInt(token.tokenBalance)
            const balance = formatUnits(balanceBigInt, TOKEN_DECIMALS['USDC.e'])
            balances['USDC.e'] = parseFloat(balance).toFixed(6)
            
            // Additional verification - manual calculation as fallback
            const manualBalance = (Number(balanceBigInt) / Math.pow(10, TOKEN_DECIMALS['USDC.e'])).toFixed(6)
            
            // Use manual calculation if viem returns 0 but manual calculation shows a balance
            if (balances['USDC.e'] === '0.000000' && parseFloat(manualBalance) > 0) {
              balances['USDC.e'] = manualBalance
            }
          } catch (error) {
            console.error('USDC.e balance parsing error:', error)
            // Fallback to manual calculation
            try {
              const balanceBigInt = BigInt(token.tokenBalance)
              balances['USDC.e'] = (Number(balanceBigInt) / Math.pow(10, TOKEN_DECIMALS['USDC.e'])).toFixed(6)
            } catch (fallbackError) {
              console.error('USDC.e manual fallback failed:', fallbackError)
            }
          }
        }
      }
    }

    return balances
  } catch (error) {
    console.error('❌ ERC20 balance error:', error)
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
  // Debug log for checking what address is being used
  console.log('🔍 BLOCKCHAIN DEBUG: Fetching for address:', walletAddress)
  
  try {
    const [ethBalance, erc20Balances] = await Promise.all([
      fetchNativeETHBalance(walletAddress),
      fetchERC20Balances(walletAddress),
    ])

    const result = {
      WLD: erc20Balances.WLD,
      'USDC.e': erc20Balances['USDC.e'],
      ETH: ethBalance,
    }

    console.log('🔍 BLOCKCHAIN DEBUG: Result for', walletAddress, ':', result)
    return result
  } catch (error) {
    console.error('❌ Balance fetch failed for', walletAddress, ':', error)
    throw error
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
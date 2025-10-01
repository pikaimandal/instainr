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
  console.log(`🌐 Calling ${method}...`)
  
  if (!process.env.ALCHEMY_API_KEY) {
    throw new Error('ALCHEMY_API_KEY not configured')
  }
  
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
  
  if (data.error) {
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
    const formattedBalance = formatUnits(BigInt(balance), 18)
    const finalBalance = parseFloat(formattedBalance).toFixed(6)
    console.log(`✅ ETH: ${finalBalance}`)
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
          const balance = formatUnits(BigInt(token.tokenBalance), TOKEN_DECIMALS.WLD)
          balances.WLD = parseFloat(balance).toFixed(6)
          console.log(`✅ WLD: ${balances.WLD}`)
        } else if (contractAddress === TOKEN_CONTRACTS['USDC.e'].toLowerCase() && token.tokenBalance && token.tokenBalance !== '0x0') {
          const balance = formatUnits(BigInt(token.tokenBalance), TOKEN_DECIMALS['USDC.e'])
          balances['USDC.e'] = parseFloat(balance).toFixed(6)
          console.log(`✅ USDC.e: ${balances['USDC.e']}`)
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
  console.log('💰 Fetching balances for:', walletAddress)
  
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

    console.log('✅ Balance fetch complete:', result)
    return result
  } catch (error) {
    console.error('❌ Balance fetch failed:', error)
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
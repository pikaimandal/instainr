import { formatUnits } from 'viem'

// World Chain Mainnet configuration
export const WORLD_CHAIN_CONFIG = {
  chainId: 480,
  rpcUrl: 'https://worldchain-mainnet.g.alchemy.com/public',
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

// ERC20 balance function signature
const BALANCE_OF_SIGNATURE = '0x70a08231'

/**
 * Creates the data payload for ERC20 balanceOf call
 * @param address - The wallet address to check balance for
 * @returns The encoded function call data
 */
function createBalanceOfData(address: string): string {
  // Remove 0x prefix and pad to 32 bytes (64 hex characters)
  const paddedAddress = address.slice(2).padStart(64, '0')
  return BALANCE_OF_SIGNATURE + paddedAddress
}

/**
 * Makes an RPC call to the World Chain network
 * @param method - The RPC method to call
 * @param params - The parameters for the RPC call
 * @returns The response from the RPC call
 */
async function makeRpcCall(method: string, params: any[]): Promise<any> {
  const response = await fetch(WORLD_CHAIN_CONFIG.rpcUrl, {
    method: 'POST',
    headers: {
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
    throw new Error(`RPC call failed: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`)
  }

  return data.result
}

/**
 * Fetches the balance of a specific token for a wallet address
 * @param walletAddress - The wallet address to check
 * @param tokenSymbol - The token symbol (WLD, USDC.e, or ETH)
 * @returns The formatted balance as a string
 */
export async function fetchTokenBalance(
  walletAddress: string,
  tokenSymbol: keyof typeof TOKEN_CONTRACTS
): Promise<string> {
  try {
    let balance: string

    if (tokenSymbol === 'ETH') {
      // For ETH, we need to get both native ETH and WETH balances
      // First get native ETH balance
      const nativeBalance = await makeRpcCall('eth_getBalance', [walletAddress, 'latest'])
      
      // Then get WETH balance
      const wethData = createBalanceOfData(walletAddress)
      const wethBalance = await makeRpcCall('eth_call', [
        {
          to: TOKEN_CONTRACTS.ETH,
          data: wethData,
        },
        'latest',
      ])

      // Convert both to decimal and add them
      const nativeAmount = BigInt(nativeBalance)
      const wethAmount = BigInt(wethBalance)
      const totalAmount = nativeAmount + wethAmount
      
      balance = totalAmount.toString()
    } else {
      // For ERC20 tokens, use balanceOf
      const contractAddress = TOKEN_CONTRACTS[tokenSymbol]
      const data = createBalanceOfData(walletAddress)
      
      balance = await makeRpcCall('eth_call', [
        {
          to: contractAddress,
          data,
        },
        'latest',
      ])
    }

    // Format the balance using the token's decimals
    const decimals = TOKEN_DECIMALS[tokenSymbol]
    const formattedBalance = formatUnits(BigInt(balance), decimals)
    
    // Return with reasonable precision (max 6 decimal places)
    return parseFloat(formattedBalance).toFixed(6)
  } catch (error) {
    console.error(`Error fetching ${tokenSymbol} balance:`, error)
    return '0.000000'
  }
}

/**
 * Fetches all token balances for a wallet address
 * @param walletAddress - The wallet address to check
 * @returns Object containing all token balances
 */
export async function fetchAllTokenBalances(walletAddress: string): Promise<{
  WLD: string
  'USDC.e': string
  ETH: string
}> {
  try {
    // Fetch all balances in parallel for better performance
    const [wldBalance, usdcBalance, ethBalance] = await Promise.all([
      fetchTokenBalance(walletAddress, 'WLD'),
      fetchTokenBalance(walletAddress, 'USDC.e'),
      fetchTokenBalance(walletAddress, 'ETH'),
    ])

    return {
      WLD: wldBalance,
      'USDC.e': usdcBalance,
      ETH: ethBalance,
    }
  } catch (error) {
    console.error('Error fetching token balances:', error)
    return {
      WLD: '0.000000',
      'USDC.e': '0.000000',
      ETH: '0.000000',
    }
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
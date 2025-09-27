import { createPublicClient, createWalletClient, http, defineChain, PublicClient, WalletClient, Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import conjurerAbi from '../conjurer-abi.json' assert { type: 'json' };

// Define 0G Galileo Testnet chain
const zeroGGalileoTestnet = defineChain({
  id: 16602,
  name: 'Galileo Testnet',
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
    public: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan-galileo.0g.ai' },
  },
  testnet: true,
});

export class ContractService {
  private publicClient: PublicClient;
  private ownerWalletClient: WalletClient;
  private contractAddress: string;
  private ownerPrivateKey: string;

  constructor() {
    // Contract configuration
 
    this.contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;
    this.ownerPrivateKey = process.env.OWNER_PRIVATE_KEY as `0x${string}`;
    
    // Create account from private key
    const account = privateKeyToAccount(this.ownerPrivateKey as `0x${string}`);
    
    this.publicClient = createPublicClient({
      chain: zeroGGalileoTestnet,
      transport: http()
    });
    this.ownerWalletClient = createWalletClient({
      account: account,
      chain: zeroGGalileoTestnet,
      transport: http()
    });
  }
  
  
  
  
  /**
   * Get credits for a specific user address
   * @param userAddress - The user's wallet address
   * @returns Promise<bigint> - The number of credits the user has
   */
  public async getCredits(userAddress: string): Promise<bigint> {
    try {
      console.log(`Getting credits for user: ${userAddress}`);
      
      const credits = await this.publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: conjurerAbi,
        functionName: 'getCredits',
        args: [userAddress as `0x${string}`]
      });
  
      console.log(`User ${userAddress} has ${credits} credits`);
      return credits as bigint;
    } catch (error) {
      console.error('Error getting credits:', error);
      throw new Error(`Failed to get credits for user ${userAddress}: ${error}`);
    }
  }
  
  /**
   * Decrease credits for a specific user
   * @param userAddress - The user's wallet address
   * @param decreaseAmount - Number of credits to decrease
   * @returns Promise<string> - Transaction hash
   */
  public async decreaseCredits(userAddress: string, decreaseAmount: bigint): Promise<string> {
    try {
      console.log(`Decreasing ${decreaseAmount} credits for user: ${userAddress}`);
      
      const txHash = await this.ownerWalletClient.writeContract({
        address: this.contractAddress as `0x${string}`,
        abi: conjurerAbi,
        functionName: 'decreaseCredits',
        args: [userAddress as `0x${string}`, decreaseAmount]
      });
  
      console.log(`Credits decreased. Transaction hash: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('Error decreasing credits:', error);
      throw new Error(`Failed to decrease credits for user ${userAddress}: ${error}`);
    }
}
}

import { createPublicClient, createWalletClient, http } from 'viem';
import { base, baseSepolia, hardhat } from 'viem/chains';
import hre from 'hardhat';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import {defineChain} from 'viem/utils';

dotenv.config();


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

  const chainToUse = zeroGGalileoTestnet;

async function main() {
  console.log('\n=== Conjurer Contract Credit Management ===');

  if (!process.env.OWNER_PRIVATE_KEY) {
    throw new Error('Please set OWNER_PRIVATE_KEY in your .env file');
  }

  if (!process.env.BUYER_PRIVATE_KEY) {
    throw new Error('Please set BUYER_PRIVATE_KEY in your .env file');
  }

  const ownerAccount = privateKeyToAccount(process.env.OWNER_PRIVATE_KEY as `0x${string}`);
  const buyerAccount = privateKeyToAccount(process.env.BUYER_PRIVATE_KEY as `0x${string}`);
  
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const targetUser = buyerAccount.address; // User address to decrease credits from
  const amount = 10; // Amount to decrease

  console.log('Contract address:', contractAddress);
  
  if (!targetUser || !amount) {
    throw new Error('Please provide target user address and amount: npm run get-credits <user_address> <amount>');
  }

  // Setup clients
  const publicClient = createPublicClient({
    chain: chainToUse,
    transport: http()
  });

  // Create wallet client from private key
  const ownerWalletClient = createWalletClient({
    account: ownerAccount,
    chain: chainToUse,
    transport: http()
  });

  

  try {
    // Get contract ABI
    const { abi: conjurerAbi } = await hre.artifacts.readArtifact('Conjurer');

    const decreaseAmount = BigInt(amount);

    console.log('\n=== Credit Management Flow ===');
    console.log('Target user:', targetUser);
    console.log('Amount to decrease:', decreaseAmount.toString());

    // Step 1: Get initial credits of target user
    console.log('\n1. Getting initial credit balance...');
    const initialCredits = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: conjurerAbi,
      functionName: 'getCredits',
      args: [targetUser as `0x${string}`]
    });

    console.log('Initial credits:', initialCredits.toString());


    if (initialCredits < decreaseAmount) {
      throw new Error(`Insufficient credits. User has ${initialCredits.toString()} credits, trying to decrease ${decreaseAmount.toString()}`);
    }

    // Step 2: Decrease credits
    console.log('\n2. Decreasing credits...');
    const decreaseHash = await ownerWalletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: conjurerAbi,
      functionName: 'decreaseCredits',
      args: [targetUser as `0x${string}`, decreaseAmount]
    });

    console.log('Transaction hash:', decreaseHash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: decreaseHash });
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    // Step 3: Get final credits
    console.log('\n3. Getting final credit balance...');
    const finalCredits = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: conjurerAbi,
      functionName: 'getCredits',
      args: [targetUser as `0x${string}`]
    });

    console.log('Final credits:', finalCredits.toString());

    // Summary
    console.log('\n=== Credit Management Summary ===');
    console.log('Target User:', targetUser);
    console.log('Amount Decreased:', decreaseAmount.toString());
    console.log('Initial Credits:', initialCredits.toString());
    console.log('Final Credits:', finalCredits.toString());
    console.log('Credits Actually Decreased:', (initialCredits - finalCredits).toString());
    console.log('Transaction Hash:', decreaseHash);

  } catch (error) {
    console.error('Error during credit operation:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

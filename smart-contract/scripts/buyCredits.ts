import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { base, baseSepolia, hardhat } from 'viem/chains';
import hre from 'hardhat';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config();

const chainToUse = hardhat;

async function main() {
  console.log('\n=== Buying Credits from Conjurer Contract ===');

  if (!process.env.BUYER_PRIVATE_KEY) {
    throw new Error('Please set PRIVATE_KEY in your .env file');
  }


  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error('Please set CONTRACT_ADDRESS in your .env file');
  }
  // Get contract address from command line argument
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const buyerAccount = privateKeyToAccount(process.env.BUYER_PRIVATE_KEY as `0x${string}`);

  // Get amount to spend from command line argument (optional, defaults to 0.001 ETH)
  const ethAmount = '0.001';
  const weiAmount = parseEther(ethAmount);

  console.log('Contract address:', contractAddress);
  console.log('Buyer address:', buyerAccount.address);
  console.log('Amount to spend:', ethAmount, 'ETH');
  console.log('Amount in wei:', weiAmount.toString());

  // Setup clients
  const publicClient = createPublicClient({
    chain: chainToUse,
    transport: http()
  });

  // Create wallet client from private key
 
  const buyerWalletClient = createWalletClient({
    account: buyerAccount,
    chain: chainToUse,
    transport: http()
  });

  
  try {
    // Get contract ABI
    const { abi: conjurerAbi } = await hre.artifacts.readArtifact('Conjurer');

    // Check current credit balance before purchase
    console.log('\nChecking current credit balance...');
    const currentCredits = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: conjurerAbi,
      functionName: 'getCredits',
      args: [buyerAccount.address]
    });

    console.log('Current credits:', currentCredits.toString());

    // Check credit price
    const creditPrice = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: conjurerAbi,
      functionName: 'creditPrice',
      args: []
    });

    console.log('Credit price:', creditPrice.toString(), 'wei');
    console.log('Credit price in ETH:', parseFloat(creditPrice.toString()) / 1e18);

    // Calculate expected credits
    const expectedCredits = weiAmount / creditPrice;
    console.log('Expected credits to receive:', expectedCredits.toString());

    // Buy credits
    console.log('\nBuying credits...');
    const buyCreditsHash = await buyerWalletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: conjurerAbi,
      functionName: 'buyCredits',
      args: [],
      value: weiAmount
    });

    console.log('Transaction hash:', buyCreditsHash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: buyCreditsHash });
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    // Check new credit balance
    console.log('\nChecking new credit balance...');
    const newCredits = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: conjurerAbi,
      functionName: 'getCredits',
      args: [buyerAccount.address]
    });

    const creditsReceived = newCredits - currentCredits;
    console.log('New credits:', newCredits.toString());
    console.log('Credits received:', creditsReceived.toString());

    console.log('\n=== Purchase Summary ===');
    console.log('Contract Address:', contractAddress);
    console.log('User Address:', buyerAccount.address);
    console.log('Amount Spent:', ethAmount, 'ETH');
    console.log('Credits Received:', creditsReceived.toString());
    console.log('Total Credits:', newCredits.toString());
    console.log('Transaction Hash:', buyCreditsHash);

  } catch (error) {
    console.error('Error during credit purchase:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

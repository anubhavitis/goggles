import { createPublicClient, createWalletClient, formatEther, http, parseEther } from 'viem';
import { base, baseSepolia, hardhat } from 'viem/chains';
import hre from 'hardhat';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import { defineChain } from 'viem/utils';

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
  console.log('\n=== Withdrawing Funds from Conjurer Contract ===');

  if (!process.env.PRIVATE_KEY) {
    throw new Error('Please set PRIVATE_KEY in your .env file');
  }


  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error('Please set CONTRACT_ADDRESS in your .env file');
  }
  // Get contract address from command line argument
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const ownerAccount = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

  // Get amount to spend from command line argument (optional, defaults to 0.001 ETH)
  const ethAmount = '0.001';
  const weiAmount = parseEther(ethAmount);

  console.log('Contract address:', contractAddress);
  console.log('Owner address:', ownerAccount.address);
  console.log('Amount to spend:', ethAmount, 'ETH');
  console.log('Amount in wei:', weiAmount.toString());

  // Setup clients
  const publicClient = createPublicClient({
    chain: chainToUse,
    transport: http()
  });

  const ownerWalletClient = createWalletClient({
    account: ownerAccount,
    chain: chainToUse,
    transport: http()
  });


  
  try {
    // Get contract ABI
    const { abi: conjurerAbi } = await hre.artifacts.readArtifact('Conjurer');

    // Check current contract balance
    const initialContractBalance = await publicClient.getBalance({
      address: contractAddress as `0x${string}`
    });
    console.log('Current contract balance:', formatEther(initialContractBalance), 'ETH');

    // Withdraw funds
    const withdrawHash = await ownerWalletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: conjurerAbi,
      functionName: 'withdraw'
    });

    console.log('Transaction hash:', withdrawHash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: withdrawHash });
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    // Check final contract balance
    const finalContractBalance = await publicClient.getBalance({
      address: contractAddress as `0x${string}`
    });
    console.log('Final contract balance:', formatEther(finalContractBalance), 'ETH');

    // Check owner balance
    const finalOwnerBalance = await publicClient.getBalance({
      address: ownerAccount.address
    });
    console.log('Final owner balance:', formatEther(finalOwnerBalance), 'ETH');

    // Summary
    console.log('\n=== Withdrawal Summary ===');
    console.log('Contract Address:', contractAddress);
    console.log('Owner Address:', ownerAccount.address);
    console.log('Amount Withdrawn:', formatEther(initialContractBalance), 'ETH');
    console.log('Transaction Hash:', withdrawHash);

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

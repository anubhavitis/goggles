import { createPublicClient, createWalletClient, http } from 'viem';
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

  const chainToDeploy = zeroGGalileoTestnet;

async function main() {
  console.log('\n=== Starting goggles Contract Deployment ===');

  if (!process.env.PRIVATE_KEY) {
    throw new Error('Please set PRIVATE_KEY in your .env file');
  }

  // Setup clients
  const publicClient = createPublicClient({
    chain: chainToDeploy,
    transport: http()
  });

  // Create wallet client from private key
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: chainToDeploy,
    transport: http()
  });

  const owner = account.address;

  console.log('Deploying to chain:', chainToDeploy.name);
  console.log('Owner address:', owner);

  try {
    // Deploy goggles contract
    console.log('\nDeploying goggles contract...');
    const { abi: gogglesAbi, bytecode: gogglesBytecode } = await hre.artifacts.readArtifact('Goggles');
    
    const gogglesHash = await walletClient.deployContract({
      abi: gogglesAbi,
      bytecode: gogglesBytecode as `0x${string}`,
      args: [] // goggles contract has no constructor arguments
    });
    
    const gogglesReceipt = await publicClient.waitForTransactionReceipt({ hash: gogglesHash });
    
    if (!gogglesReceipt.contractAddress) {
      throw new Error('goggles deployment failed - no contract address in receipt');
    }
    
    const goggles = {
      address: gogglesReceipt.contractAddress,
      abi: gogglesAbi
    };
    
    console.log('goggles deployed at:', goggles.address);

    // Verify deployment by reading initial state
    console.log('\nVerifying deployment...');
    const contractOwner = await publicClient.readContract({
      address: goggles.address,
      abi: goggles.abi,
      functionName: 'owner',
      args: []
    });
    
    const creditPrice = await publicClient.readContract({
      address: goggles.address,
      abi: goggles.abi,
      functionName: 'creditPrice',
      args: []
    });

    console.log('Contract owner:', contractOwner);
    console.log('Credit price:', creditPrice.toString(), 'wei');

    console.log('\n=== Deployment Summary ===');
    console.log('Chain:', chainToDeploy.name);
    console.log('goggles Address:', goggles.address);
    console.log('Owner Address:', owner);
    console.log('Credit Price:', creditPrice.toString(), 'wei (0.0001 ETH)');
    console.log('Transaction Hash:', gogglesHash);

  } catch (error) {
    console.error('Error during contract deployment:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

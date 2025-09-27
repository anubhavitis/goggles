import { createPublicClient, createWalletClient, http } from 'viem';
import { base, baseSepolia, hardhat } from 'viem/chains';
import hre from 'hardhat';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config();

const chainToDeploy = hardhat;

async function main() {
  console.log('\n=== Starting Conjurer Contract Deployment ===');

  if (!process.env.OWNER_PRIVATE_KEY) {
    throw new Error('Please set PRIVATE_KEY in your .env file');
  }

  // Setup clients
  const publicClient = createPublicClient({
    chain: chainToDeploy,
    transport: http()
  });

  // Create wallet client from private key
  const account = privateKeyToAccount(process.env.OWNER_PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: chainToDeploy,
    transport: http()
  });

  const owner = account.address;

  console.log('Deploying to chain:', chainToDeploy.name);
  console.log('Owner address:', owner);

  try {
    // Deploy Conjurer contract
    console.log('\nDeploying Conjurer contract...');
    const { abi: conjurerAbi, bytecode: conjurerBytecode } = await hre.artifacts.readArtifact('Conjurer');
    
    const conjurerHash = await walletClient.deployContract({
      abi: conjurerAbi,
      bytecode: conjurerBytecode as `0x${string}`,
      args: [] // Conjurer contract has no constructor arguments
    });
    
    const conjurerReceipt = await publicClient.waitForTransactionReceipt({ hash: conjurerHash });
    
    if (!conjurerReceipt.contractAddress) {
      throw new Error('Conjurer deployment failed - no contract address in receipt');
    }
    
    const conjurer = {
      address: conjurerReceipt.contractAddress,
      abi: conjurerAbi
    };
    
    console.log('Conjurer deployed at:', conjurer.address);

    // Verify deployment by reading initial state
    console.log('\nVerifying deployment...');
    const contractOwner = await publicClient.readContract({
      address: conjurer.address,
      abi: conjurer.abi,
      functionName: 'owner',
      args: []
    });
    
    const creditPrice = await publicClient.readContract({
      address: conjurer.address,
      abi: conjurer.abi,
      functionName: 'creditPrice',
      args: []
    });

    console.log('Contract owner:', contractOwner);
    console.log('Credit price:', creditPrice.toString(), 'wei');

    console.log('\n=== Deployment Summary ===');
    console.log('Chain:', chainToDeploy.name);
    console.log('Conjurer Address:', conjurer.address);
    console.log('Owner Address:', owner);
    console.log('Credit Price:', creditPrice.toString(), 'wei (0.0001 ETH)');
    console.log('Transaction Hash:', conjurerHash);

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

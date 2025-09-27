import { expect } from 'chai';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { hardhat } from 'viem/chains';
import hre from 'hardhat';
import { Account } from 'viem/accounts';

describe('Conjurer', () => {
  let publicClient: any;
  let walletClient: any;
  let conjurer: any;
  let owner: `0x${string}`;
  let user1: `0x${string}`;
  let user2: `0x${string}`;
  let hardhatAccounts: any[];

  before(async () => {
    // Setup clients
    publicClient = createPublicClient({
      chain: hardhat,
      transport: http()
    });

    // Get accounts from hardhat
    hardhatAccounts = await hre.viem.getWalletClients();
    owner = hardhatAccounts[0].account.address;
    user1 = hardhatAccounts[1].account.address;
    user2 = hardhatAccounts[2].account.address;

    // Create wallet client for owner
    walletClient = createWalletClient({
      account: hardhatAccounts[0].account as Account,
      chain: hardhat,
      transport: http()
    });

    console.log('\n=== Contract Deployment ===');
    console.log('Owner address:', owner);
    console.log('User1 address:', user1);
    console.log('User2 address:', user2);

    try {
      // Deploy Conjurer contract
      console.log('\nDeploying Conjurer contract...');
      const { abi: conjurerAbi, bytecode: conjurerBytecode } = await hre.artifacts.readArtifact('Conjurer');
      
      const conjurerHash = await walletClient.deployContract({
        abi: conjurerAbi,
        bytecode: conjurerBytecode as `0x${string}`
      });
      
      const conjurerReceipt = await publicClient.waitForTransactionReceipt({ hash: conjurerHash });
      
      if (!conjurerReceipt.contractAddress) {
        throw new Error('Conjurer deployment failed - no contract address in receipt');
      }
      
      conjurer = {
        address: conjurerReceipt.contractAddress,
        abi: conjurerAbi
      };
      
      console.log('Conjurer deployed at:', conjurer.address);

    } catch (error) {
      console.error('Error during contract deployment:', error);
      throw error;
    }
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const contractOwner = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'owner'
      });
      expect(contractOwner.toLowerCase()).to.equal(owner.toLowerCase());
    });

    it('Should set the correct credit price', async function () {
      const creditPrice = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'creditPrice'
      });
      expect(creditPrice).to.equal(parseEther('0.0001'));
    });

    it('Should have zero initial balance', async function () {
      const balance = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getContractBalance'
      });
      expect(balance).to.equal(0n);
    });
  });

  describe('Credit Purchase', function () {
    it('Should allow users to buy credits with native tokens', async function () {
      const user1WalletClient = createWalletClient({
        account: hardhatAccounts[1].account as Account,
        chain: hardhat,
        transport: http()
      });

      const purchaseAmount = parseEther('0.001'); // 0.001 ETH
      const expectedCredits = 10n; // 0.001 / 0.0001 = 10 credits

      // Buy credits
      await user1WalletClient.writeContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'buyCredits',
        value: purchaseAmount
      });

      // Check user's credit balance
      const userCredits = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getCredits',
        args: [user1]
      });

      expect(userCredits).to.equal(expectedCredits);

      // Check contract balance
      const contractBalance = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getContractBalance'
      });

      expect(contractBalance).to.equal(purchaseAmount);
    });

    it('Should accumulate credits for multiple purchases', async function () {
      const user1WalletClient = createWalletClient({
        account: hardhatAccounts[1].account as Account,
        chain: hardhat,
        transport: http()
      });

      const purchaseAmount = parseEther('0.0005'); // 0.0005 ETH
      const expectedAdditionalCredits = 5n; // 0.0005 / 0.0001 = 5 credits

      // Get initial credits
      const initialCredits = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getCredits',
        args: [user1]
      });

      // Buy more credits
      await user1WalletClient.writeContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'buyCredits',
        value: purchaseAmount
      });

      // Check updated credit balance
      const finalCredits = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getCredits',
        args: [user1]
      });

      expect(finalCredits).to.equal(initialCredits + expectedAdditionalCredits);
    });

    it('Should reject purchases with insufficient payment', async function () {
      const user2WalletClient = createWalletClient({
        account: hardhatAccounts[2].account as Account,
        chain: hardhat,
        transport: http()
      });

      const insufficientAmount = parseEther('0.00005'); // Less than credit price

      await expect(
        user2WalletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'buyCredits',
          value: insufficientAmount
        })
      ).to.be.rejectedWith(/Insufficient payment for credits/);
    });

    it('Should reject purchases with zero payment', async function () {
      const user2WalletClient = createWalletClient({
        account: hardhatAccounts[2].account as Account,
        chain: hardhat,
        transport: http()
      });

      await expect(
        user2WalletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'buyCredits',
          value: 0n
        })
      ).to.be.rejectedWith(/Amount must be greater than 0/);
    });
  });

  describe('Credit Management', function () {
    it('Should allow owner to decrease user credits', async function () {
      const decreaseAmount = 5n;

      // Get initial credits
      const initialCredits = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getCredits',
        args: [user1]
      });

      // Decrease credits
      await walletClient.writeContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'decreaseCredits',
        args: [user1, decreaseAmount]
      });

      // Check updated credits
      const finalCredits = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getCredits',
        args: [user1]
      });

      expect(finalCredits).to.equal(initialCredits - decreaseAmount);
    });

    it('Should reject decreasing credits below zero', async function () {
      const excessiveAmount = 1000n; // More than user has

      await expect(
        walletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'decreaseCredits',
          args: [user1, excessiveAmount]
        })
      ).to.be.rejectedWith(/Insufficient credits/);
    });

    it('Should reject non-owner from decreasing credits', async function () {
      const user1WalletClient = createWalletClient({
        account: hardhatAccounts[1].account as Account,
        chain: hardhat,
        transport: http()
      });

      await expect(
        user1WalletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'decreaseCredits',
          args: [user2, 1n]
        })
      ).to.be.rejectedWith(/Only owner can call this function/);
    });

    it('Should reject decreasing zero credits', async function () {
      await expect(
        walletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'decreaseCredits',
          args: [user1, 0n]
        })
      ).to.be.rejectedWith(/Amount must be greater than 0/);
    });
  });

  describe('Fund Withdrawal', function () {
    it('Should allow owner to withdraw funds', async function () {
      // Get initial owner balance
      const initialOwnerBalance = await publicClient.getBalance({ address: owner });

      // Get contract balance
      const contractBalance = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getContractBalance'
      });

      // Withdraw funds
      await walletClient.writeContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'withdraw'
      });

      // Check contract balance is now zero
      const finalContractBalance = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getContractBalance'
      });

      expect(finalContractBalance).to.equal(0n);

      // Check owner balance increased (approximately)
      const finalOwnerBalance = await publicClient.getBalance({ address: owner });
      expect(Number(finalOwnerBalance)).to.be.greaterThan(Number(initialOwnerBalance));
    });

    it('Should reject withdrawal when no funds available', async function () {
      await expect(
        walletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'withdraw'
        })
      ).to.be.rejectedWith(/No funds to withdraw/);
    });

    it('Should reject non-owner from withdrawing', async function () {
      const user1WalletClient = createWalletClient({
        account: hardhatAccounts[1].account as Account,
        chain: hardhat,
        transport: http()
      });

      await expect(
        user1WalletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'withdraw'
        })
      ).to.be.rejectedWith(/Only owner can call this function/);
    });
  });

  describe('Credit Price Management', function () {
    it('Should allow owner to update credit price', async function () {
      const newPrice = parseEther('0.0002');

      await walletClient.writeContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'setCreditPrice',
        args: [newPrice]
      });

      const updatedPrice = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'creditPrice'
      });

      expect(updatedPrice).to.equal(newPrice);
    });

    it('Should reject non-owner from updating credit price', async function () {
      const user1WalletClient = createWalletClient({
        account: hardhatAccounts[1].account as Account,
        chain: hardhat,
        transport: http()
      });

      const newPrice = parseEther('0.0002');

      await expect(
        user1WalletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'setCreditPrice',
          args: [newPrice]
        })
      ).to.be.rejectedWith(/Only owner can call this function/);
    });

    it('Should reject setting zero credit price', async function () {
      await expect(
        walletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'setCreditPrice',
          args: [0n]
        })
      ).to.be.rejectedWith(/Amount must be greater than 0/);
    });
  });


  describe('Edge Cases', function () {
    it('Should handle multiple users independently', async function () {

        const newPrice = parseEther('0.0001');

      await walletClient.writeContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'setCreditPrice',
        args: [newPrice]
      });

      const user2WalletClient = createWalletClient({
        account: hardhatAccounts[2].account as Account,
        chain: hardhat,
        transport: http()
      });

      const purchaseAmount = parseEther('0.001');

      // User2 buys credits
      await user2WalletClient.writeContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'buyCredits',
        value: purchaseAmount
      });

      // Check both users have correct credits
      const user1Credits = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getCredits',
        args: [user1]
      });

      const user2Credits = await publicClient.readContract({
        address: conjurer.address,
        abi: conjurer.abi,
        functionName: 'getCredits',
        args: [user2]
      });
      console.log('user2Credits', user2Credits);

      expect(Number(user1Credits)).to.be.greaterThan(0);
      expect(user2Credits).to.equal(10n); // 0.001 / 0.0001 = 10 credits
    });

    it('Should handle partial credit calculations correctly', async function () {
      const user2WalletClient = createWalletClient({
        account: hardhatAccounts[2].account as Account,
        chain: hardhat,
        transport: http()
      });

      // Send amount that doesn't divide evenly by credit price
      const purchaseAmount = parseEther('0.00005'); // 0.5 credits worth
      // This should fail because 0.00005 / 0.0001 = 0 credits, and contract requires credits > 0

      await expect(
        user2WalletClient.writeContract({
          address: conjurer.address,
          abi: conjurer.abi,
          functionName: 'buyCredits',
          value: purchaseAmount
        })
      ).to.be.rejectedWith(/Insufficient payment for credits/);
    });
  });
});

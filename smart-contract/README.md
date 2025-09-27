# Conjurer Smart Contract

A credit-based smart contract that allows users to purchase credits using native tokens and manage credit balances.

## Features

- Buy credits using native tokens (ETH)
- Owner can decrease user credits
- Owner can withdraw contract funds
- Owner can update credit price
- Credit price: 0.0001 ETH per credit

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here
```

## Deployment

### Deploy to Base Sepolia (Testnet)
```bash
npm run deploy
```

### Deploy to Base Mainnet
```bash
npm run deploy:base
```

### Manual deployment
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
npx hardhat run scripts/deploy.ts --network base
```

## Buy Credits

After deploying the contract, you can buy credits using the script:

```bash
# Buy credits with default amount (0.001 ETH)
npm run buy-credits <contract_address>

# Buy credits with custom amount
npm run buy-credits <contract_address> 0.01
```

Example:
```bash
npm run buy-credits 0x1234567890123456789012345678901234567890 0.005
```

## Credit Management Flow

Get initial credits, decrease credits, and show final credits in a single flow (owner only):

```bash
npm run get-credits <user_address> <amount>
```

Example:
```bash
npm run get-credits 0x1234567890123456789012345678901234567890 10
```

This will:
1. Show the user's initial credit balance
2. Decrease the specified amount of credits
3. Show the final credit balance
4. Display a summary of the operation

## Contract Functions

- `buyCredits()` - Purchase credits by sending ETH
- `getCredits(address user)` - Get user's credit balance
- `decreaseCredits(address user, uint256 amount)` - Owner only: decrease user credits
- `withdraw()` - Owner only: withdraw contract funds
- `setCreditPrice(uint256 newPrice)` - Owner only: update credit price
- `getContractBalance()` - Get contract's ETH balance

## Testing

```bash
npx hardhat test
```

## Development

```bash
npx hardhat help
npx hardhat node
```

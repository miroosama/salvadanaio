# 🐷 Salvadanaio

**Il salvadanaio digitale per gli italiani.**

A simple, Italian-first DeFi savings app that gives Italians better returns than any conto deposito — powered by Aave V3 on Base.

## Architecture

```
User (mobile browser, Italian)
  → Next.js app (mobile-first, Italian UI)
    → Privy (email login → embedded wallet, no MetaMask)
      → ERC-4626 Vault contract on Base
        → Aave V3 USDC lending pool
          → ~5-6% APY, instant withdrawal
```

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Set up Privy

1. Go to [dashboard.privy.io](https://dashboard.privy.io) and create a free account
2. Create a new app
3. Copy your App ID

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your Privy App ID
```

### 4. Run dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone (use your local IP).

## Smart Contract Deployment

The vault contract is in `contracts/Salvadanaio.sol`. To deploy:

### Option A: Remix (quickest, no local toolchain)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Paste `Salvadanaio.sol`
3. Install OpenZeppelin via Remix plugin
4. Compile with Solidity 0.8.20+
5. Deploy to Base Sepolia first (get testnet ETH from [base sepolia faucet](https://www.alchemy.com/faucets/base-sepolia))
6. Constructor args:
   - `_usdc`: Base Sepolia USDC address
   - `_aavePool`: Aave V3 Pool on Base Sepolia
   - `_aUsdc`: Aave aUSDC on Base Sepolia
7. Copy deployed address → `.env.local` → `NEXT_PUBLIC_VAULT_ADDRESS`

### Option B: Foundry (recommended for iteration)

```bash
# Install foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create foundry project alongside Next.js
cd contracts
forge init --no-commit
forge install OpenZeppelin/openzeppelin-contracts

# Deploy to Base Sepolia
forge create Salvadanaio \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --constructor-args $USDC_ADDRESS $AAVE_POOL_ADDRESS $AUSDC_ADDRESS
```

## Project Structure

```
salvadanaio/
├── contracts/
│   └── Salvadanaio.sol          # ERC-4626 vault → Aave V3
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout, metadata, fonts
│   │   ├── page.tsx             # Landing page + auth'd dashboard
│   │   └── globals.css          # Tailwind + custom styles
│   ├── components/
│   │   ├── Dashboard.tsx        # Main app screen
│   │   ├── YieldTicker.tsx      # Live balance counter
│   │   ├── BankComparison.tsx   # Salvadanaio vs Italian banks table
│   │   ├── DepositModal.tsx     # Deposit flow with earnings preview
│   │   └── WithdrawModal.tsx    # Withdraw flow
│   ├── providers/
│   │   └── Providers.tsx        # Privy + wagmi + React Query setup
│   ├── config/
│   │   └── wagmi.ts             # Chain & transport config
│   ├── hooks/
│   │   └── useVault.ts          # All vault read/write logic
│   └── lib/
│       └── constants.ts         # Addresses, ABIs, bank rates
├── .env.example
├── package.json
└── README.md
```

## Roadmap

- Base mainnet deployment with real USDC
- Fiat on-ramp (EUR → USDC via MoonPay/Transak)
- Tax estimation panel and annual report (modello 730)
- SEPA → USDC pipeline
- Multiple savings jars (obiettivi di risparmio)

## Key Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Aave V3 Pool | `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5` |
| Aave aUSDC | `0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB` |

## License

MIT

# 🐷 Salvadanaio

**Il salvadanaio digitale per gli italiani.**

A non-custodial, Italian-first savings app. You deposit USDC, it earns live
yield in Aave V3 on Base, and you can withdraw anytime. No bank, no lock-up, no
fee, and the money never leaves your own wallet.

Live at [salvadanaio.app](https://salvadanaio.app). **Alpha — experimental, use at your own risk.**

## How it works

```
User (mobile browser, Italian)
  → Next.js app (mobile-first, Italian UI)
    → Coinbase Smart Wallet (passkey, self-custody) — or your own wallet (MetaMask)
      → Aave's own stataUSDC — an audited ERC-4626 wrapper (we deploy NO contract)
        → Aave V3 USDC lending pool on Base
          → live APY, withdraw anytime
```

Two things make it feel unlike crypto:

- **No seed phrase.** Coinbase Smart Wallet logs in with a passkey (Face ID /
  fingerprint). The wallet is still self-custodial — Salvadanaio never holds keys
  or funds.
- **No gas.** Deposits and withdrawals for the smart wallet are sponsored by a
  CDP paymaster (ERC-7677) and batched into one signature (EIP-5792). The user
  never needs ETH. Crypto-natives can still connect an injected wallet and pay
  their own gas.

There is **no Salvadanaio vault contract and no custody**. The "vault" is Aave's
own `stataUSDC` ERC-4626 token — we only read and call it from the frontend.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- wagmi + viem, `@coinbase/wallet-sdk` (Smart Wallet, passkey) + injected (MetaMask)
- Aave V3 `stataUSDC` (StataTokenV2, ERC-4626) on Base mainnet
- Gasless: CDP Paymaster via an ERC-7677 proxy route, EIP-5792 `wallet_sendCalls`
- Fiat on-ramp: Coinbase CDP Onramp (card / Apple Pay → USDC on Base)

## Project structure

```
salvadanaio/
├── contracts/              # EXPERIMENTAL reference only — NOT deployed, NOT used by the app
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing + authenticated dashboard
│   │   ├── globals.css
│   │   └── api/
│   │       ├── paymaster/route.ts      # ERC-7677 proxy → CDP (keeps the secret URL server-side)
│   │       └── onramp-session/route.ts # Mints a CDP Onramp session token
│   ├── components/
│   │   ├── Dashboard.tsx               # Main app screen
│   │   ├── YieldTicker.tsx             # Live balance counter (ref-driven rAF, no rerenders)
│   │   ├── FundModal.tsx               # Buy USDC via CDP Onramp
│   │   ├── DepositModal.tsx
│   │   └── WithdrawModal.tsx           # Liquidity-aware withdraw
│   ├── config/
│   │   └── wagmi.ts                    # Chains, connectors, transports
│   ├── hooks/
│   │   ├── useVault.ts                 # All deposit/withdraw/read logic
│   │   └── useAaveApy.ts               # Live Aave APY read
│   └── lib/
│       └── constants.ts               # Addresses, ABIs, ACTIVE_CHAIN switch
└── README.md
```

To point the whole app at testnet vs mainnet, flip the single `ACTIVE_CHAIN`
constant in `src/lib/constants.ts`; addresses, labels and the explorer follow it.

## Key addresses (Base Mainnet)

| What | Address |
|------|---------|
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| stataUSDC (Aave ERC-4626 wrapper) | `0xC768c589647798a6EE01A91FdE98EF2ed046DBD6` |

## Roadmap

- Second on-ramp provider (EUR → USDC), pending Italy eligibility review
- Tax estimation panel and annual report helper
- Multiple savings jars (obiettivi di risparmio)

## License

MIT

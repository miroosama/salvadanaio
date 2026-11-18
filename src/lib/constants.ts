import { base, baseSepolia } from "viem/chains";

// Toggle this when going to mainnet
export const ACTIVE_CHAIN = baseSepolia;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

// Verified addresses (Aave address book + on-chain reads, Nov 2026). The
// "vault" is Aave's own audited stataUSDC ERC-4626 wrapper — we deploy no
// contract of our own. Flipping to mainnet = switch ACTIVE_CHAIN above; the
// addresses follow. Env vars override per-field for local experiments.
const ADDRESSES = {
  [baseSepolia.id]: {
    // waBasSepUSDC — Aave's static aToken (ERC-4626) over Base Sepolia USDC.
    vault: "0xf430cb6E2b85f99222fBFA6dFEa18Ff60FA6B32a",
    // Aave faucet USDC (the reserve's underlying on testnet, 6 decimals).
    usdc: "0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f",
    // Aave permissionless Faucet for minting test USDC (isPermissioned == false).
    faucet: "0xD9145b5F45Ad4519c7ACcD6E0A4A82e83bB8A6Dc",
  },
  [base.id]: {
    // Mainnet stataUSDC: VERIFY the exact address from the Aave address book at
    // Phase 3 (two wrapper generations exist). Zero until then = "not configured".
    vault: ZERO_ADDRESS,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    faucet: ZERO_ADDRESS,
  },
} as const;

const ACTIVE_ADDRESSES =
  ADDRESSES[ACTIVE_CHAIN.id as keyof typeof ADDRESSES] ?? ADDRESSES[baseSepolia.id];

export function isConfigured(): boolean {
  return (
    CONTRACTS.vault !== ZERO_ADDRESS &&
    CONTRACTS.usdc !== ZERO_ADDRESS
  );
}

export const CONTRACTS = {
  // The vault IS Aave's stataUSDC ERC-4626 wrapper — no contract of our own.
  vault: (process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? ACTIVE_ADDRESSES.vault) as `0x${string}`,
  usdc: (process.env.NEXT_PUBLIC_USDC_ADDRESS ?? ACTIVE_ADDRESSES.usdc) as `0x${string}`,
  faucet: (process.env.NEXT_PUBLIC_FAUCET_ADDRESS ?? ACTIVE_ADDRESSES.faucet) as `0x${string}`,
} as const;

export const USDC_DECIMALS = 6;

export const IS_TESTNET = ACTIVE_CHAIN.id === baseSepolia.id;
export const CHAIN_LABEL = ACTIVE_CHAIN.name;

// Explorer derived from the active chain, so links follow it to mainnet.
export const EXPLORER_NAME =
  ACTIVE_CHAIN.blockExplorers?.default.name ?? "Explorer";
const EXPLORER_URL = ACTIVE_CHAIN.blockExplorers?.default.url ?? "";

export function explorerTxUrl(hash: string): string {
  return EXPLORER_URL ? `${EXPLORER_URL}/tx/${hash}` : "";
}

// Italian bank rates for comparison
// Generic, indicative ranges for typical Italian retail options — no named
// institutions (avoids comparative claims against a specific bank). Net figures
// use the 26% interest tax; our own row carries the harsher 33% self-handicap.
export const COMPARISON_ROWS = [
  {
    label: "Conto deposito vincolato tipico",
    gross: "~1–2%",
    net: "~0,7–1,5%",
    lockup: "12 mesi",
  },
  {
    label: "Conto corrente",
    gross: "~0%",
    net: "~0%",
    lockup: "Nessuno",
  },
] as const;

// Fallback mainnet yield, shown only while the live Aave APY loads (the real rate
// is read on-chain from Base MAINNET — see useAaveApy; testnet yield is ~0, moot).
export const SALVADANAIO_ESTIMATED_RATE = 5.5;

// Italy, 2026: crypto gains taxed at 33%, plus a 0.2%/yr IC wealth tax on holdings.
export const ITALIAN_CRYPTO_TAX_RATE = 33;
export const ITALIAN_IC_RATE = 0.2;

// Honest net yield after Italian taxes: gains at 33%, minus the 0.2% IC on
// principal. Not tax advice — the UI carries a "consulta un commercialista" note.
export function netYield(grossRatePct: number): number {
  return grossRatePct * (1 - ITALIAN_CRYPTO_TAX_RATE / 100) - ITALIAN_IC_RATE;
}

// ABIs
export const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "convertToAssets",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalAssets",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "maxDeposit",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "redeem",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "assets", type: "uint256" }],
  },
  {
    name: "maxWithdraw",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "previewDeposit",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

// Aave's permissionless Faucet (testnet only): mint test USDC to any address.
// mint(token, to, amount) — isPermissioned == false, no per-call cap.
export const AAVE_FAUCET_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

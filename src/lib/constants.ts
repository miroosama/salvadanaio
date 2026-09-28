import { base, baseSepolia } from "viem/chains";

// Toggle this when going to mainnet
export const ACTIVE_CHAIN = baseSepolia;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

// Warns instead of throwing on a missing/invalid address, so the build can
// prerender without env vars and the app surfaces the issue at runtime.
function requireAddress(value: string | undefined, name: string): `0x${string}` {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    if (typeof window !== "undefined") {
      console.error(
        `Missing or invalid ${name}. Set it in .env.local (see .env.example).`
      );
    }
    return ZERO_ADDRESS;
  }
  return value as `0x${string}`;
}

export function isConfigured(): boolean {
  return (
    CONTRACTS.vault !== ZERO_ADDRESS &&
    CONTRACTS.usdc !== ZERO_ADDRESS
  );
}

export const CONTRACTS = {
  vault: requireAddress(process.env.NEXT_PUBLIC_VAULT_ADDRESS, "NEXT_PUBLIC_VAULT_ADDRESS"),
  usdc: (process.env.NEXT_PUBLIC_USDC_ADDRESS ??
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") as `0x${string}`,
  aavePool: (process.env.NEXT_PUBLIC_AAVE_POOL_ADDRESS ??
    "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5") as `0x${string}`,
  aUsdc: (process.env.NEXT_PUBLIC_AUSDC_ADDRESS ??
    "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB") as `0x${string}`,
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
export const BANK_RATES = [
  { name: "Intesa Sanpaolo", grossRate: 2.1, taxRate: 20, lockup: "6-12 mesi", minimum: "€500" },
  { name: "Banca Progetto", grossRate: 3.0, taxRate: 20, lockup: "32 giorni", minimum: "€1" },
  { name: "UniCredit", grossRate: 1.5, taxRate: 20, lockup: "12 mesi", minimum: "€5.000" },
  { name: "Poste Italiane", grossRate: 1.0, taxRate: 20, lockup: "12 mesi", minimum: "€500" },
] as const;

export const SALVADANAIO_ESTIMATED_RATE = 5.5;
export const ITALIAN_CRYPTO_TAX_RATE = 26;

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

// MockUSDC faucet function (testnet only)
export const MOCK_USDC_ABI = [
  ...ERC20_ABI,
  {
    name: "faucet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

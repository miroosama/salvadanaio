"use client";

import { useReadContract } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { SALVADANAIO_ESTIMATED_RATE } from "@/lib/constants";

// Aave V3 ProtocolDataProvider + USDC per chain, for the live supply APY.
const AAVE_RATE_SOURCE: Record<
  number,
  { dataProvider: `0x${string}`; usdc: `0x${string}` }
> = {
  [base.id]: {
    dataProvider: "0x0F43731EB8d45A581f4a36DD74F5f358bc90C73A",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  [baseSepolia.id]: {
    dataProvider: "0xBc9f5b7E248451CdD7cA54e717a2BFe1F32b566b",
    usdc: "0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f",
  },
};

const SECONDS_PER_YEAR = 31_536_000;

const DATA_PROVIDER_ABI = [
  {
    name: "getReserveData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      { name: "unbacked", type: "uint256" },
      { name: "accruedToTreasuryScaled", type: "uint256" },
      { name: "totalAToken", type: "uint256" },
      { name: "totalStableDebt", type: "uint256" },
      { name: "totalVariableDebt", type: "uint256" },
      { name: "liquidityRate", type: "uint256" },
      { name: "variableBorrowRate", type: "uint256" },
      { name: "stableBorrowRate", type: "uint256" },
      { name: "averageStableBorrowRate", type: "uint256" },
      { name: "liquidityIndex", type: "uint256" },
      { name: "variableBorrowIndex", type: "uint256" },
      { name: "lastUpdateTimestamp", type: "uint40" },
    ],
  },
] as const;

// Live Aave USDC supply APY (%). Defaults to Base MAINNET — the real product rate
// a user actually earns — regardless of the connected chain. Pass a chainId to
// read a specific chain (e.g. the active chain, for the balance counter so it
// tracks real growth). Falls back to the mainnet estimate while the read loads.
export function useAaveApy(chainId: number = base.id): {
  apy: number;
  isLive: boolean;
} {
  const source = AAVE_RATE_SOURCE[chainId] ?? AAVE_RATE_SOURCE[base.id];

  const { data } = useReadContract({
    chainId,
    address: source.dataProvider,
    abi: DATA_PROVIDER_ABI,
    functionName: "getReserveData",
    args: [source.usdc],
    query: { refetchInterval: 60_000, staleTime: 60_000 },
  });

  if (!data) return { apy: SALVADANAIO_ESTIMATED_RATE, isLive: false };

  const apr = Number(data[5]) / 1e27; // liquidityRate is in ray (1e27)
  const apy = ((1 + apr / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1) * 100;
  return { apy, isLive: true };
}

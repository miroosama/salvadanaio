"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, AAVE_FAUCET_ABI, USDC_DECIMALS } from "@/lib/constants";

interface TestnetFaucetProps {
  onMinted: () => void;
}

export default function TestnetFaucet({ onMinted }: TestnetFaucetProps) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMint = async () => {
    if (!address) return;
    setIsLoading(true);
    setSuccess(false);
    try {
      await writeContractAsync({
        address: CONTRACTS.faucet,
        abi: AAVE_FAUCET_ABI,
        functionName: "mint",
        args: [CONTRACTS.usdc, address, parseUnits("1000", USDC_DECIMALS)],
      });
      setSuccess(true);
      // Give the tx a moment to be indexed before refetching balances.
      setTimeout(() => {
        onMinted();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Faucet error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-mint-50 border border-mint-100 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-mint-800 text-sm">
            Modalità Testnet
          </h3>
          <p className="text-mint-700 text-xs mt-1 leading-relaxed">
            Stai usando Base Sepolia. Premi il pulsante per ricevere 1.000 USDC
            di test gratuiti.
          </p>
          <button
            onClick={handleMint}
            disabled={isLoading}
            className="mt-3 px-4 py-2 rounded-lg bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-terracotta-300 text-white font-medium text-sm transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Invio in corso...
              </span>
            ) : success ? (
              "✓ 1.000 USDC ricevuti!"
            ) : (
              "Ricevi 1.000 USDC test"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

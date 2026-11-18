"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
  useSwitchChain,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  CONTRACTS,
  VAULT_ABI,
  ERC20_ABI,
  USDC_DECIMALS,
  ACTIVE_CHAIN,
  CHAIN_LABEL,
} from "@/lib/constants";
import { useAaveApy } from "./useAaveApy";

export type DepositStep = "approving" | "depositing";

export function useVault() {
  const { address, isConnected, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const isCorrectChain = !isConnected || chainId === ACTIVE_CHAIN.id;
  const switchToActiveChain = useCallback(
    () => switchChain({ chainId: ACTIVE_CHAIN.id }),
    [switchChain]
  );

  const { data: usdcBalance, refetch: refetchUsdc } = useReadContract({
    address: CONTRACTS.usdc,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    data: vaultShares,
    refetch: refetchShares,
    isLoading: isSharesLoading,
  } = useReadContract({
    address: CONTRACTS.vault,
    abi: VAULT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Share balance converted to USDC, so the value reflects accrued yield.
  const {
    data: vaultBalance,
    refetch: refetchVaultBalance,
    isLoading: isVaultBalanceLoading,
  } = useReadContract({
    address: CONTRACTS.vault,
    abi: VAULT_ABI,
    functionName: "convertToAssets",
    args: vaultShares ? [vaultShares] : undefined,
    query: { enabled: !!vaultShares && vaultShares > 0n },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.usdc,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.vault] : undefined,
    query: { enabled: !!address },
  });

  const formattedUsdcBalance = usdcBalance
    ? formatUnits(usdcBalance as bigint, USDC_DECIMALS)
    : "0";

  const formattedVaultBalance = vaultBalance
    ? formatUnits(vaultBalance as bigint, USDC_DECIMALS)
    : "0";

  // Still resolving until shares settle — and, if there are shares, until the
  // asset conversion settles too. Drives the balance skeleton.
  const isPositionLoading =
    !!address &&
    (isSharesLoading ||
      (!!vaultShares && vaultShares > 0n && isVaultBalanceLoading));

  // Cosmetic per-second counter so the balance visibly ticks up between reads.
  // Counter ticks at the ACTIVE chain's live Aave APY so it matches real vault
  // growth (on testnet that's ~flat — real yield is negligible there).
  const { apy: activeApy } = useAaveApy(ACTIVE_CHAIN.id);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const baseAmount = parseFloat(formattedVaultBalance);
    if (baseAmount <= 0) {
      setDisplayValue(0);
      return;
    }

    // Paint the real balance now; the interval only animates the ticks after
    // (otherwise it reads $0.00 for the first second).
    setDisplayValue(baseAmount);

    const perSecondRate = activeApy / 100 / 365 / 24 / 3600;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setDisplayValue(baseAmount + baseAmount * perSecondRate * elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [formattedVaultBalance, activeApy]);

  const deposit = useCallback(
    async (amount: string, onStep?: (step: DepositStep) => void) => {
      if (!address) throw new Error("Wallet non connesso");

      const parsedAmount = parseUnits(amount, USDC_DECIMALS);
      const currentAllowance = (allowance as bigint) ?? 0n;

      if (currentAllowance < parsedAmount) {
        onStep?.("approving");
        const approveTxHash = await writeContractAsync({
          address: CONTRACTS.usdc,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACTS.vault, parsedAmount], // approve exactly what we deposit — no scary "unlimited" cap
        });
        // Deposit must not send until the approval has mined, or it reverts.
        await publicClient?.waitForTransactionReceipt({ hash: approveTxHash });
        await refetchAllowance();
      }

      onStep?.("depositing");
      const depositTxHash = await writeContractAsync({
        address: CONTRACTS.vault,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [parsedAmount, address],
      });
      await publicClient?.waitForTransactionReceipt({ hash: depositTxHash });
      return depositTxHash;
    },
    [address, allowance, writeContractAsync, refetchAllowance, publicClient]
  );

  const withdraw = useCallback(
    async (amount: string, isMax = false) => {
      if (!address) throw new Error("Wallet non connesso");

      // ERC-4626 rounds share->asset down, so a full-balance withdraw() can
      // exceed maxWithdraw by a wei and revert; redeem the shares instead.
      const txHash = isMax
        ? await writeContractAsync({
            address: CONTRACTS.vault,
            abi: VAULT_ABI,
            functionName: "redeem",
            args: [(vaultShares as bigint) ?? 0n, address, address],
          })
        : await writeContractAsync({
            address: CONTRACTS.vault,
            abi: VAULT_ABI,
            functionName: "withdraw",
            args: [parseUnits(amount, USDC_DECIMALS), address, address],
          });

      await publicClient?.waitForTransactionReceipt({ hash: txHash });
      return txHash;
    },
    [address, writeContractAsync, vaultShares, publicClient]
  );

  const refetchAll = useCallback(() => {
    refetchUsdc();
    refetchShares();
    refetchVaultBalance();
    refetchAllowance();
  }, [refetchUsdc, refetchShares, refetchVaultBalance, refetchAllowance]);

  return {
    isConnected,
    address,
    isCorrectChain,
    switchToActiveChain,
    isSwitchingChain,
    activeChainLabel: CHAIN_LABEL,
    usdcBalance: formattedUsdcBalance,
    vaultBalance: formattedVaultBalance,
    displayValue,
    isPositionLoading,
    deposit,
    withdraw,
    refetchAll,
  };
}

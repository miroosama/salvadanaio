"use client";

import { useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
  useSwitchChain,
  useConfig,
} from "wagmi";
import { sendCalls, waitForCallsStatus } from "@wagmi/core";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
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

// ERC-7677 paymaster capability → our server proxy (forwards to CDP, keeps the
// secret URL off the client). Same-origin so it resolves in dev and prod.
function paymasterCapabilities() {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/paymaster`
      : "/api/paymaster";
  return { paymasterService: { url } };
}

export function useVault() {
  const { address, isConnected, chainId, connector } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const config = useConfig();

  // Coinbase Smart Wallet supports sponsored EIP-5792 batched calls; an injected
  // EOA (MetaMask) does not and falls back to regular user-paid txs.
  const isSmartWallet = connector?.id === "coinbaseWalletSDK";

  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const isCorrectChain = !isConnected || chainId === ACTIVE_CHAIN.id;
  const switchToActiveChain = useCallback(
    () => switchChain({ chainId: ACTIVE_CHAIN.id }),
    [switchChain]
  );

  const { data: usdcBalance, refetch: refetchUsdc } = useReadContract({
    address: CONTRACTS.usdc,
    chainId: ACTIVE_CHAIN.id,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    data: vaultShares,
    refetch: refetchShares,
    isLoading: isSharesLoading,
    isError: isSharesError,
  } = useReadContract({
    address: CONTRACTS.vault,
    chainId: ACTIVE_CHAIN.id,
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
    isError: isVaultBalanceError,
  } = useReadContract({
    address: CONTRACTS.vault,
    chainId: ACTIVE_CHAIN.id,
    abi: VAULT_ABI,
    functionName: "convertToAssets",
    args: vaultShares ? [vaultShares] : undefined,
    query: { enabled: !!vaultShares && vaultShares > 0n },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.usdc,
    chainId: ACTIVE_CHAIN.id,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.vault] : undefined,
    query: { enabled: !!address },
  });

  // How much the user can withdraw *right now* — Aave caps this by the pool's
  // available liquidity, so in the rare high-utilization moment it's below the
  // full balance. Lets the withdraw flow show "disponibile ora" + avoid a revert.
  const { data: maxWithdraw, refetch: refetchMaxWithdraw } = useReadContract({
    address: CONTRACTS.vault,
    chainId: ACTIVE_CHAIN.id,
    abi: VAULT_ABI,
    functionName: "maxWithdraw",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const formattedUsdcBalance = usdcBalance
    ? formatUnits(usdcBalance as bigint, USDC_DECIMALS)
    : "0";

  const formattedVaultBalance = vaultBalance
    ? formatUnits(vaultBalance as bigint, USDC_DECIMALS)
    : "0";

  // Fall back to the full balance until the read settles, so we never falsely
  // tell the user they can withdraw less than they actually can.
  const formattedMaxWithdraw =
    maxWithdraw !== undefined
      ? formatUnits(maxWithdraw as bigint, USDC_DECIMALS)
      : formattedVaultBalance;

  // Still resolving until shares settle — and, if there are shares, until the
  // asset conversion settles too. Drives the balance skeleton.
  const isPositionLoading =
    !!address &&
    (isSharesLoading ||
      (!!vaultShares && vaultShares > 0n && isVaultBalanceLoading));

  // A read failed — surface it so the ticker freezes with an "aggiornamento…"
  // state instead of extrapolating growth off a stale/dead feed (honesty guard).
  const isPositionError = isSharesError || isVaultBalanceError;

  // Live Aave APY on the active chain — the fallback slope for the balance
  // ticker. The ticker itself animates in YieldTicker via a ref (no per-frame
  // rerenders) and anchors to the real convertToAssets value on each read.
  const { apy: activeApy } = useAaveApy(ACTIVE_CHAIN.id);

  const deposit = useCallback(
    async (amount: string, onStep?: (step: DepositStep) => void) => {
      if (!address) throw new Error("Wallet non connesso");

      const parsedAmount = parseUnits(amount, USDC_DECIMALS);

      // Gasless path (Coinbase Smart Wallet): approve + deposit batched into ONE
      // sponsored bundle — a single signature, no ETH, gas paid by the paymaster.
      if (isSmartWallet) {
        onStep?.("depositing");
        const { id } = await sendCalls(config, {
          account: address,
          chainId: ACTIVE_CHAIN.id,
          // Force ONE atomic batch so `approve` lands before `deposit` reads the
          // allowance — without it the wallet can split them and deposit reverts
          // with "transfer amount exceeds allowance".
          forceAtomic: true,
          calls: [
            {
              to: CONTRACTS.usdc,
              data: encodeFunctionData({
                abi: ERC20_ABI,
                functionName: "approve",
                args: [CONTRACTS.vault, parsedAmount],
              }),
            },
            {
              to: CONTRACTS.vault,
              data: encodeFunctionData({
                abi: VAULT_ABI,
                functionName: "deposit",
                args: [parsedAmount, address],
              }),
            },
          ],
          capabilities: paymasterCapabilities(),
        });
        const { receipts } = await waitForCallsStatus(config, { id });
        await refetchAllowance();
        return receipts?.[0]?.transactionHash;
      }

      // Fallback (injected EOA, e.g. MetaMask): approve-if-needed, then deposit.
      // User pays gas. Two separate signatures.
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
    [
      address,
      isSmartWallet,
      config,
      allowance,
      writeContractAsync,
      refetchAllowance,
      publicClient,
    ]
  );

  const withdraw = useCallback(
    async (amount: string, isMax = false) => {
      if (!address) throw new Error("Wallet non connesso");

      // ERC-4626 rounds share->asset down, so a full-balance withdraw() can
      // exceed maxWithdraw by a wei and revert; redeem the shares instead.
      const callData = isMax
        ? encodeFunctionData({
            abi: VAULT_ABI,
            functionName: "redeem",
            args: [(vaultShares as bigint) ?? 0n, address, address],
          })
        : encodeFunctionData({
            abi: VAULT_ABI,
            functionName: "withdraw",
            args: [parseUnits(amount, USDC_DECIMALS), address, address],
          });

      // Gasless path (Coinbase Smart Wallet): sponsored single call, no ETH.
      if (isSmartWallet) {
        const { id } = await sendCalls(config, {
          account: address,
          chainId: ACTIVE_CHAIN.id,
          calls: [{ to: CONTRACTS.vault, data: callData }],
          capabilities: paymasterCapabilities(),
        });
        const { receipts } = await waitForCallsStatus(config, { id });
        return receipts?.[0]?.transactionHash;
      }

      // Fallback (injected EOA): user pays gas.
      const txHash = await writeContractAsync({
        address: CONTRACTS.vault,
        abi: VAULT_ABI,
        ...(isMax
          ? {
              functionName: "redeem" as const,
              args: [(vaultShares as bigint) ?? 0n, address, address] as const,
            }
          : {
              functionName: "withdraw" as const,
              args: [
                parseUnits(amount, USDC_DECIMALS),
                address,
                address,
              ] as const,
            }),
      });
      await publicClient?.waitForTransactionReceipt({ hash: txHash });
      return txHash;
    },
    [address, isSmartWallet, config, writeContractAsync, vaultShares, publicClient]
  );

  const refetchAll = useCallback(() => {
    refetchUsdc();
    refetchShares();
    refetchVaultBalance();
    refetchAllowance();
    refetchMaxWithdraw();
  }, [
    refetchUsdc,
    refetchShares,
    refetchVaultBalance,
    refetchAllowance,
    refetchMaxWithdraw,
  ]);

  return {
    isConnected,
    address,
    isCorrectChain,
    switchToActiveChain,
    isSwitchingChain,
    activeChainLabel: CHAIN_LABEL,
    usdcBalance: formattedUsdcBalance,
    vaultBalance: formattedVaultBalance,
    maxWithdraw: formattedMaxWithdraw,
    activeApy,
    isPositionLoading,
    isPositionError,
    deposit,
    withdraw,
    refetchAll,
  };
}

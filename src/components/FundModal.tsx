"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { CheckIcon } from "@/components/Icons";

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: string;
  usdcBalance: string;
  onRefetch: () => void;
  onDeposit: () => void;
}

// Path A funding: send the user to their OWN Coinbase wallet to buy USDC. Same
// passkey -> same smart wallet -> USDC bought on Base lands at useAccount().address,
// the very address this app watches. No paste, no dev KYB, no minted session.
// (Path B — a card/Apple-Pay checkout via a licensed provider — is deferred.)
const COINBASE_WALLET_URL = "https://wallet.coinbase.com";

export default function FundModal({
  isOpen,
  onClose,
  address,
  usdcBalance,
  onRefetch,
  onDeposit,
}: FundModalProps) {
  const { connector } = useAccount();
  // Path A (wallet.coinbase.com) only works for the Coinbase Smart Wallet — it
  // delivers to THAT wallet's address. An injected user (MetaMask etc.) must buy
  // through their OWN wallet's Buy feature, or funds land at the wrong address.
  const isCoinbase = connector?.id === "coinbaseWalletSDK";
  const [copied, setCopied] = useState(false);
  const hasFunds = parseFloat(usdcBalance) > 0;

  // Poll while the user is off buying so the arrival is caught without a manual
  // refresh. Only while open; cleared on close.
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(onRefetch, 8000);
    return () => clearInterval(id);
  }, [isOpen, onRefetch]);

  if (!isOpen) return null;

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context) — ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card border-[1.5px] border-mint-300 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-modal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-warmGray-900">
            Aggiungi fondi
          </h2>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="text-warmGray-400 hover:text-warmGray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {hasFunds ? (
          <div className="text-center space-y-4 py-4">
            <CheckIcon className="w-16 h-16 mx-auto text-mint-500" />
            <p className="font-display text-xl text-ink">Fondi arrivati</p>
            <p className="text-warmGray-500 text-sm">
              Hai {parseFloat(usdcBalance).toFixed(2)} USDC pronti da depositare.
            </p>
            <button
              onClick={onDeposit}
              className="w-full py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-lg transition active:scale-[0.97]"
            >
              Deposita ora
            </button>
          </div>
        ) : (
          <>
            <p className="text-warmGray-600 text-sm leading-relaxed mb-5">
              {isCoinbase
                ? "Compra USDC dal tuo wallet Coinbase. Arrivano qui in automatico, di solito in pochi minuti — non devi copiare né incollare niente."
                : "Compra USDC direttamente dal tuo wallet. Usa la sua funzione Compra / Aggiungi fondi: gli USDC arrivano qui in automatico, non devi incollare niente."}
            </p>

            <ol className="space-y-3 text-sm text-warmGray-600 mb-5">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint-50 text-mint-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span>
                  {isCoinbase ? (
                    <>
                      Apri il tuo wallet Coinbase e accedi con la stessa passkey
                      (Face ID o impronta).
                    </>
                  ) : (
                    <>
                      Apri il tuo wallet e tocca <strong>Compra</strong> (o{" "}
                      <strong>Aggiungi fondi</strong>).
                    </>
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint-50 text-mint-700 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span>
                  {isCoinbase ? (
                    <>
                      Tocca <strong>Compra</strong> e scegli{" "}
                      <strong>USDC</strong>.
                    </>
                  ) : (
                    <>
                      Scegli <strong>USDC</strong> come token da comprare.
                    </>
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint-50 text-mint-700 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span>
                  Assicurati che la rete sia <strong>Base</strong>, poi conferma
                  l&apos;acquisto.
                </span>
              </li>
            </ol>

            {isCoinbase && (
              <a
                href={COINBASE_WALLET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-lg transition active:scale-[0.97] shadow-lg shadow-terracotta-500/20"
              >
                Apri Coinbase ↗
              </a>
            )}

            {address && (
              <div className="mt-5">
                <p className="text-warmGray-600 text-xs mb-1">
                  Riceverai gli USDC a questo indirizzo
                </p>
                <button
                  onClick={copyAddress}
                  className="w-full text-left bg-warmGray-100 hover:bg-warmGray-200 rounded-xl px-4 py-3 transition active:scale-[0.99]"
                >
                  <span className="font-mono text-xs text-warmGray-700 break-all">
                    {address}
                  </span>
                  <span className="block text-xs text-terracotta-600 mt-1">
                    {copied ? "Copiato!" : "Tocca per copiare"}
                  </span>
                </button>
              </div>
            )}

            <div className="mt-5 flex items-center justify-center gap-2 text-warmGray-500 text-xs">
              <span className="w-4 h-4 border-2 border-warmGray-300 border-t-terracotta-500 rounded-full animate-spin" />
              In attesa dell&apos;arrivo dei fondi…
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/Icons";
import ModalPortal from "@/components/ModalPortal";

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: string;
  usdcBalance: string;
  onRefetch: () => void;
  onDeposit: () => void;
}

// Funding via Coinbase's hosted onramp (pay.coinbase.com): a session token minted
// server-side locks delivery to the connected address (USDC on Base). Works for
// any wallet; falls back to showing the address for a manual send if it fails.
export default function FundModal({
  isOpen,
  onClose,
  address,
  usdcBalance,
  onRefetch,
  onDeposit,
}: FundModalProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const [startBalance, setStartBalance] = useState(0);

  // Poll while the user is off buying so arrival is caught without a refresh.
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(onRefetch, 8000);
    return () => clearInterval(id);
  }, [isOpen, onRefetch]);

  // Snapshot the balance on open (synchronously, not in an effect — that runs too
  // late and flashes the success screen). "Fondi arrivati" then shows only when
  // NEW funds land this session, so opening to buy more still shows the buy flow.
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setStartBalance(parseFloat(usdcBalance) || 0);
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }
  const arrived =
    wasOpen && (parseFloat(usdcBalance) || 0) > startBalance + 1e-6;

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

  const openOnramp = async () => {
    if (!address) return;
    // Reserve the popup inside the user gesture so it isn't blocked after the
    // await; we set its location once the session token is ready.
    const win = window.open("", "_blank");
    setLoading(true);
    setSessionError(false);
    try {
      const res = await fetch("/api/onramp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok || !data?.token) throw new Error(data?.error || "no token");
      const url =
        `https://pay.coinbase.com/buy/select-asset?sessionToken=${encodeURIComponent(
          data.token
        )}&defaultAsset=USDC&defaultNetwork=base&fiatCurrency=EUR`;
      if (win) win.location.href = url;
      else window.location.href = url;
    } catch {
      if (win) win.close();
      setSessionError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
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

        {arrived ? (
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
              Compra USDC con Apple Pay, carta o il tuo account Coinbase. Arrivano
              qui sulla rete Base in automatico — non devi copiare né incollare
              niente.
            </p>

            <button
              onClick={openOnramp}
              disabled={loading || !address}
              className="block w-full text-center py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-warmGray-200 disabled:text-warmGray-400 text-white font-semibold text-lg transition active:scale-[0.97] shadow-lg shadow-terracotta-500/20"
            >
              {loading ? "Apertura…" : "Compra USDC ↗"}
            </button>

            {sessionError && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">
                Non siamo riusciti ad aprire il checkout. Puoi comunque inviare
                USDC sulla <strong>rete Base</strong> all&apos;indirizzo qui
                sotto.
              </div>
            )}

            {address && (
              <div className="mt-5">
                <p className="text-warmGray-600 text-xs mb-1">
                  Riceverai gli USDC a questo indirizzo (rete Base)
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
    </ModalPortal>
  );
}

"use client";

import { useState } from "react";
import {
  SALVADANAIO_ESTIMATED_RATE,
  ITALIAN_CRYPTO_TAX_RATE,
  explorerTxUrl,
  EXPLORER_NAME,
} from "@/lib/constants";
import { parseTxError, type FriendlyError } from "@/lib/errors";
import type { DepositStep } from "@/hooks/useVault";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  usdcBalance: string;
  onDeposit: (
    amount: string,
    onStep?: (step: DepositStep) => void
  ) => Promise<string | undefined>;
}

export default function DepositModal({
  isOpen,
  onClose,
  usdcBalance,
  onDeposit,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<DepositStep | null>(null);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const yearlyGross = numAmount * (SALVADANAIO_ESTIMATED_RATE / 100);
  const yearlyNet = yearlyGross * (1 - ITALIAN_CRYPTO_TAX_RATE / 100);
  const monthlyNet = yearlyNet / 12;

  const reset = () => {
    setAmount("");
    setError(null);
    setTxHash(null);
    setStep(null);
  };

  const handleClose = () => {
    if (isLoading) return; // don't close mid-transaction
    reset();
    onClose();
  };

  const handleDeposit = async () => {
    if (numAmount <= 0) {
      setError({ title: "Inserisci un importo valido.", detail: "" });
      return;
    }
    if (numAmount > parseFloat(usdcBalance)) {
      setError({ title: "Saldo USDC insufficiente.", detail: "" });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const hash = await onDeposit(amount, setStep);
      setTxHash(hash ?? null);
    } catch (err) {
      setError(parseTxError(err));
    } finally {
      setIsLoading(false);
      setStep(null);
    }
  };

  const setPercentage = (pct: number) => {
    const bal = parseFloat(usdcBalance);
    if (bal <= 0) return;
    // MAX sends the exact on-chain balance (a rounded float could exceed it
    // and revert); partial percentages are safely under, so 2 decimals is fine.
    setAmount(pct === 1 ? usdcBalance : (bal * pct).toFixed(2));
  };

  const pendingLabel =
    step === "approving" ? "Autorizzazione..." : "Deposito in corso...";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal - slides up on mobile */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-warmGray-900">Deposita</h2>
          <button
            onClick={handleClose}
            className="text-warmGray-400 hover:text-warmGray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {txHash ? (
          <div className="text-center space-y-4 py-4">
            <span className="text-5xl block">✅</span>
            <p className="font-display text-xl text-warmGray-900">
              Deposito completato
            </p>
            <p className="text-warmGray-500 text-sm">
              I tuoi USDC sono ora nel salvadanaio e iniziano a fruttare.
            </p>
            {explorerTxUrl(txHash) && (
              <a
                href={explorerTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-terracotta-600 hover:text-terracotta-700 text-sm underline underline-offset-2"
              >
                Vedi transazione su {EXPLORER_NAME} ↗
              </a>
            )}
            <button
              onClick={handleClose}
              className="w-full py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-lg transition-colors"
            >
              Fatto
            </button>
          </div>
        ) : (
          <>
        {/* Amount input */}
        <div className="bg-warmGray-50 rounded-xl p-4 mb-4">
          <label className="text-warmGray-500 text-sm block mb-2">
            Importo (USDC)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-warmGray-400 text-xl">$</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0,00"
              className="flex-1 bg-transparent text-3xl font-semibold text-warmGray-900 outline-none placeholder:text-warmGray-300"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-warmGray-400 text-xs">
              Disponibile: {parseFloat(usdcBalance).toFixed(2)} USDC
            </span>
            <div className="flex gap-2">
              {[0.25, 0.5, 1].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setPercentage(pct)}
                  className="text-xs px-2 py-1 rounded-md bg-warmGray-200 text-warmGray-600 hover:bg-terracotta-100 hover:text-terracotta-600 transition-colors"
                >
                  {pct === 1 ? "MAX" : `${pct * 100}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Earnings preview */}
        {numAmount > 0 && (
          <div className="bg-olive-50 rounded-xl p-4 mb-4 space-y-2">
            <p className="text-olive-700 text-sm font-medium">
              Stima guadagno
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-warmGray-500">Al mese (netto)</span>
              <span className="text-olive-700 font-semibold">
                +${monthlyNet.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warmGray-500">All&apos;anno (netto)</span>
              <span className="text-olive-700 font-semibold">
                +${yearlyNet.toFixed(2)}
              </span>
            </div>
            <p className="text-warmGray-400 text-xs mt-1">
              Netto stimato dopo il 26% di tassazione su plusvalenze
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 px-1">
            <p className="text-red-600 text-sm font-medium">{error.title}</p>
            {error.detail && (
              <details className="mt-1">
                <summary className="text-warmGray-400 text-xs cursor-pointer select-none">
                  Dettagli tecnici
                </summary>
                <p className="text-warmGray-400 text-xs mt-1 font-mono break-all">
                  {error.detail}
                </p>
              </details>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleDeposit}
          disabled={isLoading || numAmount <= 0}
          className="w-full py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-warmGray-200 disabled:text-warmGray-400 text-white font-semibold text-lg transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {pendingLabel}
            </span>
          ) : (
            "Deposita"
          )}
        </button>
          </>
        )}
      </div>
    </div>
  );
}

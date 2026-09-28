"use client";

import { useState } from "react";
import { explorerTxUrl, EXPLORER_NAME } from "@/lib/constants";
import { parseTxError, type FriendlyError } from "@/lib/errors";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultBalance: string;
  onWithdraw: (amount: string, isMax?: boolean) => Promise<string | undefined>;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  vaultBalance,
  onWithdraw,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const reset = () => {
    setAmount("");
    setError(null);
    setTxHash(null);
  };

  const handleClose = () => {
    if (isLoading) return; // don't close mid-transaction
    reset();
    onClose();
  };

  const handleWithdraw = async () => {
    if (numAmount <= 0) {
      setError({ title: "Inserisci un importo valido.", detail: "" });
      return;
    }
    if (numAmount > parseFloat(vaultBalance)) {
      setError({ title: "Importo superiore al saldo disponibile.", detail: "" });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Treat "everything" as a full redeem so rounding can't revert it
      const isMax = numAmount >= parseFloat(vaultBalance);
      const hash = await onWithdraw(amount, isMax);
      setTxHash(hash ?? null);
    } catch (err) {
      setError(parseTxError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-warmGray-900">Preleva</h2>
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
              Prelievo completato
            </p>
            <p className="text-warmGray-500 text-sm">
              I tuoi USDC sono tornati nel tuo wallet.
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
              className="w-full py-4 rounded-xl bg-warmGray-800 hover:bg-warmGray-900 text-white font-semibold text-lg transition-colors"
            >
              Fatto
            </button>
          </div>
        ) : (
          <>
        {/* Amount input */}
        <div className="bg-warmGray-50 rounded-xl p-4 mb-4">
          <label className="text-warmGray-500 text-sm block mb-2">
            Importo da prelevare (USDC)
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
              Disponibile: {parseFloat(vaultBalance).toFixed(2)} USDC
            </span>
            <button
              onClick={() => setAmount(vaultBalance)}
              className="text-xs px-2 py-1 rounded-md bg-warmGray-200 text-warmGray-600 hover:bg-terracotta-100 hover:text-terracotta-600 transition-colors"
            >
              TUTTO
            </button>
          </div>
        </div>

        <div className="bg-warmGray-50 rounded-xl p-4 mb-4">
          <p className="text-warmGray-600 text-sm">
            ⚡ Prelievo istantaneo, nessun vincolo temporale. I tuoi fondi
            tornano nel tuo wallet immediatamente.
          </p>
        </div>

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

        <button
          onClick={handleWithdraw}
          disabled={isLoading || numAmount <= 0}
          className="w-full py-4 rounded-xl bg-warmGray-800 hover:bg-warmGray-900 disabled:bg-warmGray-200 disabled:text-warmGray-400 text-white font-semibold text-lg transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Prelievo in corso...
            </span>
          ) : (
            "Preleva"
          )}
        </button>
          </>
        )}
      </div>
    </div>
  );
}

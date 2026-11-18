"use client";

import { useState } from "react";
import { explorerTxUrl, EXPLORER_NAME } from "@/lib/constants";
import { parseTxError, type FriendlyError } from "@/lib/errors";
import { CheckIcon } from "@/components/Icons";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultBalance: string;
  maxWithdraw: string;
  onWithdraw: (amount: string, isMax?: boolean) => Promise<string | undefined>;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  vaultBalance,
  maxWithdraw,
  onWithdraw,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const vaultNum = parseFloat(vaultBalance) || 0;
  const maxNum = parseFloat(maxWithdraw) || 0;
  const EPS = 1e-6;

  // Aave can't cover the full balance right now (rare, high utilization). Only
  // then do we surface the "disponibile ora" nuance — otherwise nothing shows.
  const liquidityLimited = maxNum + EPS < vaultNum;
  const exceedsAvailable = numAmount > maxNum + EPS;
  const showLiquidityBlock = liquidityLimited && exceedsAvailable;

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

  const submit = async (amt: string, isMax: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const hash = await onWithdraw(amt, isMax);
      setTxHash(hash ?? null);
    } catch (err) {
      setError(parseTxError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (numAmount <= 0) {
      setError({ title: "Inserisci un importo valido.", detail: "" });
      return;
    }
    if (numAmount > vaultNum + EPS) {
      setError({ title: "Importo superiore al saldo disponibile.", detail: "" });
      return;
    }
    // Over what Aave can release right now: don't revert — the liquidity block
    // and its "massimo disponibile" button handle it instead.
    if (showLiquidityBlock) return;

    // Treat "everything" as a full redeem so rounding can't revert it.
    const isMax = numAmount >= vaultNum - EPS;
    await submit(amount, isMax);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-card border-[1.5px] border-mint-300 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-modal">
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
            <CheckIcon className="w-16 h-16 mx-auto text-mint-500" />
            <p className="font-display text-xl text-ink">
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
              className="w-full py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-lg transition active:scale-[0.97]"
            >
              Fatto
            </button>
          </div>
        ) : (
          <>
        <div className="bg-white border border-mint-200 rounded-xl p-4 mb-4">
          <label className="text-warmGray-500 text-sm block mb-2">
            Importo da prelevare (USDC)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-terracotta-500 text-xl">$</span>
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
            <span className="text-warmGray-600 text-xs">
              Disponibile: {parseFloat(vaultBalance).toFixed(2)} USDC
            </span>
            <button
              onClick={() => setAmount(vaultBalance)}
              className="text-xs px-2 py-1 rounded-md bg-mint-50 text-mint-700 border border-mint-300 hover:bg-mint-100 transition active:scale-[0.97]"
            >
              TUTTO
            </button>
          </div>
        </div>

        {showLiquidityBlock ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 space-y-3">
            <p className="text-amber-800 text-sm leading-relaxed">
              Al momento puoi prelevare subito{" "}
              <span className="font-semibold">${maxNum.toFixed(2)}</span>. Il
              resto si libera a breve, man mano che la liquidità torna
              disponibile. Nessun vincolo, nessuna penale.
            </p>
            <button
              onClick={() => submit(maxWithdraw, false)}
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold text-sm transition active:scale-[0.97]"
            >
              Preleva il massimo disponibile (${maxNum.toFixed(2)})
            </button>
          </div>
        ) : (
          <div className="bg-mint-50 border border-mint-200 rounded-xl p-4 mb-4">
            <p className="text-warmGray-600 text-sm leading-relaxed">
              Prelievi senza vincoli né penali. L&apos;unico caso in cui un
              prelievo attende è se il pool di Aave è momentaneamente pieno, cosa
              rara che si risolve quando i prestiti vengono rimborsati.
            </p>
          </div>
        )}

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
          disabled={isLoading || numAmount <= 0 || showLiquidityBlock}
          className="w-full py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-warmGray-200 disabled:text-warmGray-400 text-white font-semibold text-lg transition active:scale-[0.97]"
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
        {!isLoading && (
          <p className="text-center text-warmGray-600 text-xs mt-3">
            Si aprirà una finestra Coinbase per confermare.
          </p>
        )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useVault, type DepositStep } from "@/hooks/useVault";
import YieldTicker from "./YieldTicker";
import BankComparison from "./BankComparison";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import TestnetFaucet from "./TestnetFaucet";
import {
  SALVADANAIO_ESTIMATED_RATE,
  ITALIAN_CRYPTO_TAX_RATE,
  IS_TESTNET,
} from "@/lib/constants";

export default function Dashboard() {
  const {
    isConnected,
    address,
    isCorrectChain,
    switchToActiveChain,
    isSwitchingChain,
    activeChainLabel,
    usdcBalance,
    vaultBalance,
    displayValue,
    deposit,
    withdraw,
    refetchAll,
  } = useVault();

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const hasDeposit = parseFloat(vaultBalance) > 0;
  const hasUsdc = parseFloat(usdcBalance) > 0;
  const netRate =
    SALVADANAIO_ESTIMATED_RATE * (1 - ITALIAN_CRYPTO_TAX_RATE / 100);

  const handleDeposit = async (
    amount: string,
    onStep?: (step: DepositStep) => void
  ) => {
    const hash = await deposit(amount, onStep);
    refetchAll();
    return hash;
  };

  const handleWithdraw = async (amount: string, isMax = false) => {
    const hash = await withdraw(amount, isMax);
    refetchAll();
    return hash;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Wrong-network guard */}
      {isConnected && !isCorrectChain && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <p className="text-amber-800 text-sm">
            Sei sulla rete sbagliata. Passa a{" "}
            <span className="font-semibold">{activeChainLabel}</span> per
            continuare.
          </p>
          <button
            onClick={switchToActiveChain}
            disabled={isSwitchingChain}
            className="shrink-0 text-sm font-semibold px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white transition-colors"
          >
            {isSwitchingChain ? "..." : "Cambia rete"}
          </button>
        </div>
      )}

      {/* Testnet faucet (only shows on testnet) */}
      {IS_TESTNET && <TestnetFaucet onMinted={refetchAll} />}

      {/* Main savings card */}
      <div className="savings-card rounded-2xl border border-warmGray-200 p-6">
        {/* Rate badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-warmGray-500">Tasso attuale</span>
          <div className="flex items-center gap-2">
            <span className="bg-olive-100 text-olive-700 text-sm font-semibold px-3 py-1 rounded-full">
              ~{SALVADANAIO_ESTIMATED_RATE}% lordo
            </span>
            <span className="bg-warmGray-100 text-warmGray-600 text-xs px-2 py-1 rounded-full">
              ~{netRate.toFixed(1)}% netto
            </span>
          </div>
        </div>

        {/* Balance ticker */}
        <YieldTicker displayValue={displayValue} hasDeposit={hasDeposit} />

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowDeposit(true)}
            disabled={(!hasUsdc && !hasDeposit) || !isCorrectChain}
            className="flex-1 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-warmGray-200 disabled:text-warmGray-400 text-white font-semibold text-base transition-colors shadow-sm"
          >
            Deposita
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={!hasDeposit || !isCorrectChain}
            className="flex-1 py-3.5 rounded-xl bg-warmGray-100 hover:bg-warmGray-200 disabled:opacity-40 text-warmGray-700 font-semibold text-base transition-colors"
          >
            Preleva
          </button>
        </div>

        {/* Nudge to get USDC if wallet is empty */}
        {!hasUsdc && !hasDeposit && !IS_TESTNET && (
          <p className="text-warmGray-400 text-xs text-center mt-3">
            Per iniziare, acquista USDC con il pulsante sopra
          </p>
        )}
        {!hasUsdc && !hasDeposit && IS_TESTNET && (
          <p className="text-warmGray-400 text-xs text-center mt-3">
            Usa il faucet qui sopra per ricevere USDC di test
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-warmGray-100 p-4">
          <p className="text-warmGray-400 text-xs font-medium">
            Nel salvadanaio
          </p>
          <p className="text-warmGray-900 text-lg font-semibold mt-1">
            ${parseFloat(vaultBalance).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-warmGray-100 p-4">
          <p className="text-warmGray-400 text-xs font-medium">
            USDC nel wallet
          </p>
          <p className="text-warmGray-900 text-lg font-semibold mt-1">
            ${parseFloat(usdcBalance).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bank comparison */}
      <div className="bg-white rounded-2xl border border-warmGray-100 p-5">
        <BankComparison />
      </div>

      {/* How it works */}
      <details className="bg-white rounded-2xl border border-warmGray-100 p-5">
        <summary className="font-display text-lg text-warmGray-800 cursor-pointer select-none">
          Come funziona?
        </summary>
        <div className="mt-4 space-y-4 text-sm text-warmGray-600 leading-relaxed">
          <div className="flex gap-3">
            <span className="text-xl">1️⃣</span>
            <p>
              <strong>Depositi USDC</strong> — una moneta digitale stabile
              ancorata al dollaro, usata da milioni di persone nel mondo.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-xl">2️⃣</span>
            <p>
              <strong>Noi li mettiamo a rendita</strong> — i tuoi USDC vengono
              depositati in Aave, il protocollo di prestiti decentralizzato più
              grande e sicuro al mondo con oltre $50 miliardi di depositi.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-xl">3️⃣</span>
            <p>
              <strong>Guadagni ogni secondo</strong> — gli interessi maturano
              continuamente, non a fine mese. Puoi prelevare quando vuoi, senza
              vincoli.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-xl">🔒</span>
            <p>
              <strong>Sempre al sicuro</strong> — i tuoi fondi restano sulla
              blockchain, non in mano a una banca. Il codice è aperto e
              verificabile da chiunque.
            </p>
          </div>
        </div>
      </details>

      {/* Modals */}
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        usdcBalance={usdcBalance}
        onDeposit={handleDeposit}
      />
      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        vaultBalance={vaultBalance}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useVault, type DepositStep } from "@/hooks/useVault";
import YieldTicker from "./YieldTicker";
import BankComparison from "./BankComparison";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import FundModal from "./FundModal";
import TestnetFaucet from "./TestnetFaucet";
import { LockIcon } from "@/components/Icons";
import { IS_TESTNET, isConfigured, netYield } from "@/lib/constants";
import { useAaveApy } from "@/hooks/useAaveApy";

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
    maxWithdraw,
    activeApy,
    isPositionLoading,
    isPositionError,
    deposit,
    withdraw,
    refetchAll,
  } = useVault();

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFund, setShowFund] = useState(false);

  const hasDeposit = parseFloat(vaultBalance) > 0;
  const hasUsdc = parseFloat(usdcBalance) > 0;
  const { apy } = useAaveApy();
  const netRate = netYield(apy);

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

  // Safety net for the mainnet flip: if ACTIVE_CHAIN is switched before its
  // vault/USDC addresses are filled in, show a calm "coming soon" state instead
  // of silently reading/transacting against the zero address.
  if (!isConfigured()) {
    return (
      <div className="w-full max-w-md sm:max-w-lg mx-auto">
        <div className="bg-cream rounded-2xl border border-mint-200 p-6 shadow-card text-center space-y-2">
          <p className="font-display text-xl text-ink">Presto disponibile</p>
          <p className="text-warmGray-600 text-sm leading-relaxed">
            Stiamo completando la configurazione su {activeChainLabel}. Torna tra
            poco.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto space-y-6">
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
            className="shrink-0 text-sm font-semibold px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white transition active:scale-[0.97]"
          >
            {isSwitchingChain ? "..." : "Cambia rete"}
          </button>
        </div>
      )}

      {IS_TESTNET && <TestnetFaucet onMinted={refetchAll} />}

      <div className="bg-cream rounded-2xl border border-mint-200 p-6 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-warmGray-500">Tasso attuale</span>
          <div className="flex items-center gap-2">
            <span className="bg-mint-50 text-mint-700 text-sm font-semibold px-3 py-1 rounded-full">
              ~{apy.toFixed(1)}% lordo
            </span>
            <span className="bg-warmGray-100 text-warmGray-600 text-xs px-2 py-1 rounded-full">
              ~{netRate.toFixed(1)}% netto
            </span>
          </div>
        </div>
        <p className="text-xs text-warmGray-600 -mt-1 mb-2">
          {IS_TESTNET
            ? "Rendimento Aave reale su Base mainnet · su testnet non è rappresentativo"
            : "Rendimento Aave in tempo reale · variabile"}
        </p>

        <YieldTicker
          balance={parseFloat(vaultBalance)}
          apy={activeApy}
          hasDeposit={hasDeposit}
          isLoading={isPositionLoading}
          isStale={isPositionError}
        />

        <p className="text-center text-warmGray-600 text-xs mt-4 leading-relaxed">
          Questo è in dollari (USDC) · il valore in euro può salire o scendere
        </p>

        {!hasUsdc && !hasDeposit && !IS_TESTNET ? (
          // Empty mainnet wallet: the one thing to do is add funds.
          <>
            <button
              onClick={() => setShowFund(true)}
              disabled={!isCorrectChain}
              className="w-full mt-6 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-warmGray-200 disabled:text-warmGray-400 text-white font-semibold text-base transition active:scale-[0.97] shadow-sm"
            >
              Compra USDC
            </button>
            <p className="text-warmGray-600 text-xs text-center mt-3">
              Il primo passo: aggiungi USDC. Arrivano qui in automatico, di
              solito in pochi minuti.
            </p>
          </>
        ) : (
          <>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeposit(true)}
                disabled={(!hasUsdc && !hasDeposit) || !isCorrectChain}
                className="flex-1 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-warmGray-200 disabled:text-warmGray-400 text-white font-semibold text-base transition active:scale-[0.97] shadow-sm"
              >
                Deposita
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                disabled={!hasDeposit || !isCorrectChain}
                className="flex-1 py-3.5 rounded-xl bg-warmGray-100 hover:bg-warmGray-200 disabled:opacity-40 text-warmGray-700 font-semibold text-base transition active:scale-[0.97]"
              >
                Preleva
              </button>
            </div>

            {!hasUsdc && !hasDeposit && IS_TESTNET && (
              <p className="text-warmGray-600 text-xs text-center mt-3">
                Usa il faucet qui sopra per ricevere USDC di test
              </p>
            )}
            {/* Buying is never gated: always reachable, even with a balance
                (top up, or buy more without draining to find the button). */}
            {!IS_TESTNET && (
              <button
                onClick={() => setShowFund(true)}
                className="w-full text-center text-sm font-medium text-terracotta-600 hover:text-terracotta-700 underline underline-offset-4 decoration-terracotta-300 transition mt-3"
              >
                Aggiungi fondi
              </button>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cream rounded-xl border border-mint-100 p-4 shadow-card">
          <p className="text-warmGray-600 text-xs font-medium">
            Nel salvadanaio
          </p>
          {isPositionLoading ? (
            <div className="h-6 w-20 rounded bg-warmGray-100 animate-pulse mt-1.5" />
          ) : (
            <p className="text-warmGray-900 text-lg font-semibold mt-1">
              ${parseFloat(vaultBalance).toFixed(2)}
            </p>
          )}
        </div>
        <div className="bg-cream rounded-xl border border-mint-100 p-4 shadow-card">
          <p className="text-warmGray-600 text-xs font-medium">
            USDC nel wallet
          </p>
          {isPositionLoading ? (
            <div className="h-6 w-20 rounded bg-warmGray-100 animate-pulse mt-1.5" />
          ) : (
            <p className="text-warmGray-900 text-lg font-semibold mt-1">
              ${parseFloat(usdcBalance).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="bg-cream rounded-2xl border border-mint-100 p-6 shadow-card">
        <BankComparison />
      </div>

      <details className="bg-cream rounded-2xl border border-mint-100 p-6 shadow-card">
        <summary className="font-display text-lg text-warmGray-800 cursor-pointer select-none">
          Come funziona?
        </summary>
        <div className="mt-6 space-y-4 text-sm text-warmGray-600 leading-relaxed">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint-50 text-mint-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <p>
              <strong>Depositi USDC</strong> — una moneta digitale stabile
              ancorata al dollaro, usata da milioni di persone nel mondo.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint-50 text-mint-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <p>
              <strong>Noi li mettiamo a rendita</strong> — i tuoi USDC vengono
              depositati in Aave, il protocollo di prestiti decentralizzato più
              grande e sicuro al mondo con oltre $50 miliardi di depositi.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint-50 text-mint-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <p>
              <strong>Guadagni ogni secondo</strong> — gli interessi maturano
              continuamente, non a fine mese. Puoi prelevare quando vuoi, senza
              vincoli.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint-50 text-mint-700 flex items-center justify-center">
              <LockIcon className="w-3.5 h-3.5" />
            </span>
            <p>
              <strong>Sempre nelle tue mani</strong> — i tuoi fondi restano
              tuoi. Le chiavi sono tue, noi non possiamo né toccarli né
              bloccarli. Lavorano sui contratti di Aave, pubblici e verificabili
              sulla blockchain: ogni operazione è tracciabile su BaseScan.
            </p>
          </div>
        </div>
      </details>

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
        maxWithdraw={maxWithdraw}
        onWithdraw={handleWithdraw}
      />
      <FundModal
        isOpen={showFund}
        onClose={() => setShowFund(false)}
        address={address}
        usdcBalance={usdcBalance}
        onRefetch={refetchAll}
        onDeposit={() => {
          setShowFund(false);
          setShowDeposit(true);
        }}
      />
    </div>
  );
}

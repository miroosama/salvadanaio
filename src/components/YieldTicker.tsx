"use client";

interface YieldTickerProps {
  displayBalance: string;
  hasDeposit: boolean;
}

export default function YieldTicker({
  displayBalance,
  hasDeposit,
}: YieldTickerProps) {
  if (!hasDeposit) {
    return (
      <div className="text-center py-8">
        <p className="text-warmGray-400 text-lg">
          Il tuo salvadanaio è vuoto
        </p>
        <p className="text-warmGray-300 text-sm mt-1">
          Deposita USDC per iniziare a guadagnare
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <p className="text-warmGray-500 text-sm font-medium mb-2">
        Il tuo saldo
      </p>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-warmGray-400 text-2xl">€</span>
        <span className="font-display text-5xl md:text-6xl text-warmGray-900 yield-tick tabular-nums">
          {displayBalance}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-olive-400 animate-pulse" />
        <span className="text-olive-600 text-sm font-medium">
          Sta crescendo in tempo reale
        </span>
      </div>
    </div>
  );
}

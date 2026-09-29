"use client";

interface YieldTickerProps {
  displayValue: number;
  hasDeposit: boolean;
}

export default function YieldTicker({
  displayValue,
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

  // Two decimals prominent, the sub-cent digits small + dimmed — keeps the
  // live-tick motion without reading as unrounded float noise.
  const dollars = displayValue.toFixed(2);
  const subCents = displayValue.toFixed(6).slice(dollars.length);

  return (
    <div className="text-center py-6">
      <p className="text-warmGray-500 text-sm font-medium mb-2">
        Il tuo saldo
      </p>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-warmGray-400 text-2xl">$</span>
        <span className="font-display text-5xl md:text-6xl text-warmGray-900 yield-tick tabular-nums">
          {dollars}
          <span className="text-2xl md:text-3xl text-warmGray-300">
            {subCents}
          </span>
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

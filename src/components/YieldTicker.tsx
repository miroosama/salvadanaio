"use client";

import { useEffect, useRef } from "react";

interface YieldTickerProps {
  balance: number; // real on-chain value (convertToAssets), in USD
  apy: number; // fallback slope (%/yr) until a real share-price rate is observed
  hasDeposit: boolean;
  isLoading?: boolean;
  isStale?: boolean; // a balance read errored — freeze, don't extrapolate growth
}

function parts(v: number) {
  const dollars = v.toFixed(2);
  return { dollars, sub: v.toFixed(6).slice(dollars.length) };
}

const perSec = (pct: number) => pct / 100 / (365 * 24 * 3600);

export default function YieldTicker({
  balance,
  apy,
  hasDeposit,
  isLoading = false,
  isStale = false,
}: YieldTickerProps) {
  const dollarsRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  // Ground-truth anchors: real convertToAssets value + timestamp. `prev` drives
  // the observed share-price slope; `shown` is the last rendered value (easing).
  const anchor = useRef({ value: balance, t: performance.now() });
  const prev = useRef<{ value: number; t: number } | null>(null);
  const shown = useRef(balance);
  const lastFrame = useRef(performance.now());

  // Re-anchor to the real value on every fresh read (load, focus, after a tx).
  useEffect(() => {
    if (balance !== anchor.current.value) {
      prev.current = anchor.current;
      anchor.current = { value: balance, t: performance.now() };
    }
  }, [balance]);

  // Animate via a DOM ref — NO per-frame React state, so the parent tree never
  // rerenders. Time-based (performance.now) so it stays correct across
  // backgrounded tabs and variable frame rates.
  useEffect(() => {
    // Freeze when there's no deposit, the position is loading, or a read
    // errored (isStale) — never extrapolate growth off a dead/unknown feed.
    if (!hasDeposit || isLoading || isStale) return;
    lastFrame.current = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const { value: V, t: T } = anchor.current;

      // Slope = the real observed share-price growth once we have two anchors
      // far enough apart (ground truth). A non-positive observation means growth
      // stalled or the value dropped (withdrawal / loss) — hold flat at the true
      // value, never re-inject optimistic APY on top of a drop. Only before any
      // real observation do we fall back to the quoted APY. Upper-clamp guards
      // against a noisy tiny-dt reading.
      let rate = perSec(apy);
      const p = prev.current;
      if (p && p.value > 0 && T - p.t > 2000) {
        const obs = (V - p.value) / (p.value * ((T - p.t) / 1000));
        if (obs < perSec(100)) rate = Math.max(0, obs);
      }

      // Ease toward the time-based target so a re-anchor correction glides in
      // over ~250ms instead of snapping.
      const target = V * (1 + rate * ((now - T) / 1000));
      const k = 1 - Math.exp(-(now - lastFrame.current) / 250);
      lastFrame.current = now;
      shown.current += (target - shown.current) * k;
      // Floor at the current true anchor: kills sub-read float jitter. Since V
      // drops on a lower re-anchor, this never suppresses a REAL decrease — the
      // ticker eases down to the new truth and shows it.
      if (shown.current < V) shown.current = V;

      const { dollars, sub } = parts(shown.current);
      if (dollarsRef.current) dollarsRef.current.textContent = dollars;
      if (subRef.current) subRef.current.textContent = sub;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasDeposit, isLoading, isStale, apy]);

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <p className="text-warmGray-500 text-sm font-medium mb-2">
          Il tuo saldo
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <div className="h-12 w-48 rounded-lg bg-warmGray-100 animate-pulse" />
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="h-4 w-36 rounded bg-warmGray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!hasDeposit) {
    return (
      <div className="text-center py-8">
        <p className="text-warmGray-700 text-lg">Il tuo salvadanaio è vuoto</p>
        <p className="text-warmGray-500 text-sm mt-1">
          Deposita USDC per iniziare a guadagnare
        </p>
      </div>
    );
  }

  const init = parts(balance);

  return (
    <div className="text-center py-6">
      <p className="text-warmGray-500 text-sm font-medium mb-2">Il tuo saldo</p>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-warmGray-400 text-2xl">$</span>
        <span className="font-display text-5xl md:text-6xl text-warmGray-900 yield-tick tabular-nums">
          <span ref={dollarsRef}>{init.dollars}</span>
          <span ref={subRef} className="text-2xl md:text-3xl text-warmGray-300">
            {init.sub}
          </span>
        </span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        {isStale ? (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-warmGray-300" />
            <span className="text-warmGray-600 text-sm font-medium">
              Aggiornamento…
            </span>
          </>
        ) : (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-mint-300 animate-pulse" />
            <span className="text-mint-600 text-sm font-medium">
              Sta crescendo in tempo reale
            </span>
          </>
        )}
      </div>
    </div>
  );
}

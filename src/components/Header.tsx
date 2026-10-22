"use client";

import PiggyLogo from "./PiggyLogo";
import { IS_TESTNET, CHAIN_LABEL } from "@/lib/constants";

export default function Header({ onLogout }: { onLogout?: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-cream/70 backdrop-blur-md border-b border-warmGray-200/50">
      <div className="mx-auto max-w-2xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PiggyLogo className="w-8 h-8" />
          <span className="font-display text-xl text-ink tracking-tight">
            Salvadanaio
          </span>
          {IS_TESTNET && (
            <span className="ml-1 inline-flex items-center gap-1.5 bg-mint-50 text-mint-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
              {CHAIN_LABEL}
            </span>
          )}
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-sm text-warmGray-500 hover:text-ink transition-colors"
          >
            Esci
          </button>
        )}
      </div>
    </header>
  );
}

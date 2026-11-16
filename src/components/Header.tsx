"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import PiggyLogo from "./PiggyLogo";
import { IS_TESTNET, CHAIN_LABEL } from "@/lib/constants";

export default function Header({ onLogout }: { onLogout?: () => void }) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (e.g. insecure context) — ignore
    }
  };

  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

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
        <div className="flex items-center gap-3">
          {address && (
            <button
              onClick={copyAddress}
              title="Copia il tuo indirizzo"
              className="inline-flex items-center gap-1.5 bg-warmGray-100 hover:bg-warmGray-200 text-warmGray-600 text-xs font-mono font-medium px-2.5 py-1 rounded-full transition-colors"
            >
              {copied ? (
                "Copiato!"
              ) : (
                <>
                  {short}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </>
              )}
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-sm text-warmGray-500 hover:text-ink transition-colors"
            >
              Esci
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "wagmi";
import PiggyLogo from "./PiggyLogo";
import { CHAIN_LABEL } from "@/lib/constants";

export default function Header({ onLogout }: { onLogout?: () => void }) {
  const { address } = useAccount();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  const openScopri = () => {
    window.location.hash = "scopri";
  };

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

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const chevron = (
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
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  return (
    <header className="sticky top-0 z-40 bg-cream/70 backdrop-blur-md border-b border-warmGray-200/50">
      {/* Desktop */}
      <div className="hidden sm:flex mx-auto max-w-3xl px-8 h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PiggyLogo className="w-9 h-9" />
          <span className="font-display text-2xl text-ink tracking-tight">
            Salvadanaio
          </span>
          <span className="inline-flex items-center gap-1.5 bg-mint-50 text-mint-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
            {CHAIN_LABEL}
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <button
            onClick={openScopri}
            className="text-sm font-medium text-warmGray-600 hover:text-ink px-3 py-2 rounded-lg hover:bg-warmGray-100 transition-colors"
          >
            Scopri
          </button>
          {address && (
            <button
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-1.5 bg-warmGray-100 hover:bg-warmGray-200 text-warmGray-600 text-sm font-mono font-medium px-3 py-2 rounded-full transition-colors"
            >
              {short}
              {chevron}
            </button>
          )}
        </nav>
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden mx-auto px-4 h-14 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PiggyLogo className="w-7 h-7 shrink-0" />
          <span className="font-display text-lg text-ink tracking-tight">
            Salvadanaio
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full bg-mint-400"
            title={CHAIN_LABEL}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={openScopri}
            className="text-sm font-medium text-warmGray-600 bg-warmGray-100 active:bg-warmGray-200 px-3 py-1.5 rounded-full transition-colors"
          >
            Scopri
          </button>
          {address && (
            <button
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-1 bg-warmGray-100 active:bg-warmGray-200 text-warmGray-600 text-xs font-mono font-medium px-2.5 py-1.5 rounded-full transition-colors"
            >
              {short}
              {chevron}
            </button>
          )}
        </div>
      </div>

      {mounted &&
        sheetOpen &&
        address &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Il tuo account"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSheetOpen(false)}
            />
            <div className="relative bg-card border-[1.5px] border-mint-300 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-warmGray-200 sm:hidden mb-5" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-ink">Il tuo account</h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Chiudi"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-warmGray-400 hover:text-warmGray-700 hover:bg-warmGray-100 text-2xl leading-none transition-colors"
                >
                  ×
                </button>
              </div>

              <p className="text-warmGray-600 text-xs mb-1">Indirizzo</p>
              <button
                onClick={copyAddress}
                className="w-full text-left bg-warmGray-100 hover:bg-warmGray-200 rounded-xl px-4 py-3 transition-colors"
              >
                <span className="font-mono text-sm text-warmGray-700 break-all">
                  {address}
                </span>
                <span className="block text-xs text-terracotta-600 mt-1">
                  {copied ? "Copiato!" : "Tocca per copiare"}
                </span>
              </button>

              <div className="flex items-center gap-2 mt-4 text-sm text-warmGray-500">
                <span className="w-2 h-2 rounded-full bg-mint-400" />
                Rete: {CHAIN_LABEL}
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setSheetOpen(false);
                    onLogout();
                  }}
                  className="w-full mt-6 py-3.5 rounded-xl bg-warmGray-100 hover:bg-warmGray-200 text-warmGray-700 font-semibold transition-colors"
                >
                  Esci
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}

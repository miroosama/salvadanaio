"use client";

import { usePrivy } from "@privy-io/react-auth";
import Dashboard from "@/components/Dashboard";
import BankComparison from "@/components/BankComparison";
import {
  SALVADANAIO_ESTIMATED_RATE,
  ITALIAN_CRYPTO_TAX_RATE,
  IS_TESTNET,
  CHAIN_LABEL,
} from "@/lib/constants";

function TestnetBadge() {
  if (!IS_TESTNET) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
      🧪 {CHAIN_LABEL}
    </span>
  );
}

export default function Home() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  // Still loading Privy
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (authenticated) {
    return (
      <main className="min-h-screen bg-cream pb-12">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-warmGray-100">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐷</span>
              <span className="font-display text-lg text-warmGray-800">
                Salvadanaio
              </span>
              <TestnetBadge />
            </div>
            <button
              onClick={logout}
              className="text-sm text-warmGray-400 hover:text-warmGray-600 transition-colors"
            >
              Esci
            </button>
          </div>
        </header>

        {/* Dashboard */}
        <div className="px-4 pt-6">
          <Dashboard />
        </div>
      </main>
    );
  }

  const netRate =
    SALVADANAIO_ESTIMATED_RATE * (1 - ITALIAN_CRYPTO_TAX_RATE / 100);

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto px-4 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <TestnetBadge />
          </div>
          <span className="text-6xl block">🐷</span>
          <h1 className="font-display text-4xl text-warmGray-900 leading-tight">
            Il tuo salvadanaio
            <br />
            <span className="text-terracotta-500">digitale</span>
          </h1>
          <p className="text-warmGray-500 text-lg leading-relaxed max-w-xs mx-auto">
            Guadagna fino al ~{netRate.toFixed(0)}% netto sui tuoi risparmi.
            Meglio di qualsiasi conto deposito.
          </p>
        </div>

        {/* Value props */}
        <div className="space-y-3">
          {[
            {
              icon: "📈",
              title: `~${SALVADANAIO_ESTIMATED_RATE}% annuo`,
              desc: "Rendimenti superiori a qualsiasi banca italiana",
            },
            {
              icon: "⚡",
              title: "Prelievo istantaneo",
              desc: "Nessun vincolo, nessuna penale. I tuoi soldi, sempre.",
            },
            {
              icon: "🔒",
              title: "Trasparente e sicuro",
              desc: "Basato su Aave, il protocollo DeFi più grande al mondo",
            },
            {
              icon: "🇮🇹",
              title: "Pensato per l'Italia",
              desc: "Tassazione chiara, tutto in italiano, senza sorprese",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 bg-white rounded-xl border border-warmGray-100 p-4"
            >
              <span className="text-2xl mt-0.5">{item.icon}</span>
              <div>
                <p className="font-semibold text-warmGray-800">{item.title}</p>
                <p className="text-warmGray-500 text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bank comparison */}
        <div className="bg-white rounded-2xl border border-warmGray-100 p-5">
          <BankComparison />
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={login}
            className="w-full py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-lg transition-colors shadow-lg shadow-terracotta-500/20"
          >
            Inizia a risparmiare
          </button>
          <p className="text-center text-warmGray-400 text-xs mt-3">
            Registrati con email. Nessun wallet richiesto.
          </p>
        </div>
      </div>
    </main>
  );
}

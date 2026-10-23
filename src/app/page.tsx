"use client";

import { usePrivy } from "@privy-io/react-auth";
import Dashboard from "@/components/Dashboard";
import BankComparison from "@/components/BankComparison";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PiggyLogo from "@/components/PiggyLogo";
import { TrendIcon, BoltIcon, LockIcon, FlagIcon } from "@/components/Icons";
import {
  SALVADANAIO_ESTIMATED_RATE,
  ITALIAN_CRYPTO_TAX_RATE,
} from "@/lib/constants";

export default function Home() {
  const { ready, authenticated, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 border-3 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <Header onLogout={logout} />
        <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6">
          <Dashboard />
        </main>
        <Footer />
      </div>
    );
  }

  const netRate =
    SALVADANAIO_ESTIMATED_RATE * (1 - ITALIAN_CRYPTO_TAX_RATE / 100);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-4">
          <PiggyLogo className="w-20 h-20 mx-auto" />
          <h1 className="font-display text-4xl text-ink leading-tight">
            Il tuo salvadanaio
            <br />
            <span className="text-terracotta-500">digitale</span>
          </h1>
          <p className="text-warmGray-500 text-lg leading-relaxed max-w-xs mx-auto">
            Guadagna fino al ~{netRate.toFixed(0)}% netto sui tuoi risparmi.
            Meglio di qualsiasi conto deposito.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              Icon: TrendIcon,
              title: `~${SALVADANAIO_ESTIMATED_RATE}% annuo`,
              desc: "Rendimenti superiori a qualsiasi banca italiana",
            },
            {
              Icon: BoltIcon,
              title: "Prelievo istantaneo",
              desc: "Nessun vincolo, nessuna penale. I tuoi soldi, sempre.",
            },
            {
              Icon: LockIcon,
              title: "Trasparente e sicuro",
              desc: "Basato su Aave, il protocollo DeFi più grande al mondo",
            },
            {
              Icon: FlagIcon,
              title: "Pensato per l'Italia",
              desc: "Tassazione chiara, tutto in italiano, senza sorprese",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 bg-cream rounded-xl border border-mint-100 p-4"
            >
              <span className="text-mint-500 mt-0.5">
                <item.Icon className="w-6 h-6" />
              </span>
              <div>
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-warmGray-500 text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-cream rounded-2xl border border-mint-100 p-5">
          <BankComparison />
        </div>

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
      </main>
      <Footer />
    </div>
  );
}

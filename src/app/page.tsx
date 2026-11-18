"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import Dashboard from "@/components/Dashboard";
import BankComparison from "@/components/BankComparison";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScopriOverlay from "@/components/ScopriOverlay";
import PiggyLogo from "@/components/PiggyLogo";
import { TrendIcon, BoltIcon, LockIcon, FlagIcon } from "@/components/Icons";
import { netYield } from "@/lib/constants";
import { useAaveApy } from "@/hooks/useAaveApy";

export default function Home() {
  const { isConnected, isReconnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { apy } = useAaveApy();

  // Two ways in (wallet freedom): the Coinbase Smart Wallet passkey for newcomers,
  // or the user's own injected wallet (MetaMask etc.) if they already self-custody.
  const coinbaseConnector =
    connectors.find((c) => c.id === "coinbaseWalletSDK") ?? connectors[0];
  const injectedConnector = connectors.find((c) => c.id !== "coinbaseWalletSDK");

  // wagmi has no `ready`; gate on auto-reconnect so we don't flash the
  // logged-out UI before a returning user's session is restored.
  if (isReconnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 border-3 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <Header onLogout={() => disconnect()} />
        <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto px-4 pt-6">
          <Dashboard />
        </main>
        <Footer />
        <ScopriOverlay />
      </div>
    );
  }

  const netRate = netYield(apy);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-4">
          <PiggyLogo className="w-20 h-20 mx-auto" />
          <h1 className="font-display text-4xl text-ink leading-tight">
            Il tuo salvadanaio
            <br />
            <span className="text-terracotta-500">digitale</span>
          </h1>
          <p className="text-warmGray-500 text-lg leading-relaxed max-w-xs mx-auto">
            Guadagna ~{netRate.toFixed(1)}% netto sui tuoi risparmi. Nessun
            vincolo, prelievi quando vuoi.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              Icon: TrendIcon,
              title: `~${apy.toFixed(1)}% annuo`,
              desc: "Interessi che maturano ogni secondo su Aave",
            },
            {
              Icon: BoltIcon,
              title: "Prelievo istantaneo",
              desc: "Nessun vincolo, nessuna penale. I tuoi soldi, sempre.",
            },
            {
              Icon: LockIcon,
              title: "Auto-custodia",
              desc: "Le chiavi sono tue. Noi non tocchiamo mai i tuoi fondi.",
            },
            {
              Icon: FlagIcon,
              title: "Pensato per l'Italia",
              desc: "Tassazione chiara, tutto in italiano",
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

        <div className="bg-cream rounded-2xl border border-mint-100 p-6">
          <BankComparison />
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={() =>
              coinbaseConnector && connect({ connector: coinbaseConnector })
            }
            disabled={isPending}
            className="w-full py-4 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-terracotta-300 text-white font-semibold text-lg transition-colors shadow-lg shadow-terracotta-500/20"
          >
            {isPending ? "Connessione..." : "Inizia a risparmiare"}
          </button>
          <p className="text-center text-warmGray-400 text-xs">
            Crea un account con una passkey. Niente seed phrase, niente app.
          </p>
          {injectedConnector && (
            <button
              onClick={() => connect({ connector: injectedConnector })}
              disabled={isPending}
              className="w-full text-center text-sm font-medium text-terracotta-600 hover:text-terracotta-700 underline underline-offset-4 decoration-terracotta-300 transition-colors pt-1"
            >
              Hai già un wallet? Connettilo
            </button>
          )}
        </div>
      </main>
      <Footer />
      <ScopriOverlay />
    </div>
  );
}

"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base, baseSepolia } from "viem/chains";
import { wagmiConfig } from "@/config/wagmi";

const queryClient = new QueryClient();

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

// Privy throws on an empty app ID, so short-circuit before it mounts when
// the app is unconfigured (fresh clone or a deploy missing its env vars).
function MissingConfig() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-3">
        <span className="text-5xl block">🐷</span>
        <h1 className="font-display text-2xl text-warmGray-900">
          Configurazione mancante
        </h1>
        <p className="text-warmGray-500 text-sm leading-relaxed">
          Set <code className="font-mono text-xs">NEXT_PUBLIC_PRIVY_APP_ID</code>{" "}
          and <code className="font-mono text-xs">NEXT_PUBLIC_VAULT_ADDRESS</code>{" "}
          in your environment. See <code className="font-mono text-xs">.env.example</code>.
        </p>
      </div>
    </main>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) return <MissingConfig />;

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "google"],
        appearance: {
          theme: "light",
          accentColor: "#ed7624",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        // Switch defaultChain to `base` for mainnet.
        defaultChain: baseSepolia,
        supportedChains: [base, baseSepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

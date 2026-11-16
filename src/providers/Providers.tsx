"use client";

import { WagmiProvider, type State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/config/wagmi";

const queryClient = new QueryClient();

// The Coinbase Smart Wallet connector is keyless — no app id, no config gating.
// `initialState` is hydrated from the SSR cookie so the connection is restored on
// first render (no logged-out flash, no re-sign on refresh).
export default function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

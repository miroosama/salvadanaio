import { http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
// Privy ships its own createConfig — it registers the embedded wallet
// as a connector. Using wagmi's createConfig here means wagmi never
// sees the Privy wallet and every write silently fails.
import { createConfig } from "@privy-io/wagmi";

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

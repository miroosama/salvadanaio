import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { baseAccount } from "wagmi/connectors";

// Base Account: a passkey-controlled ERC-4337 smart wallet — self-custody and
// keyless (no app id, no account). `baseAccount` is wagmi's native connector.
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [baseAccount({ appName: "Salvadanaio" })],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

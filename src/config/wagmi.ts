import { createConfig, createStorage, cookieStorage, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

// Coinbase Smart Wallet (passkey-controlled ERC-4337, self-custody) via the
// mature @coinbase/wallet-sdk. `smartWalletOnly` forces the passkey smart wallet
// (no extension/EOA fallback). We use this instead of the `baseAccount` connector
// because baseAccount's SDK re-opens a sign-in popup on every reconnect, whereas
// wallet-sdk restores the session from localStorage silently. Same wallet infra,
// same keys.coinbase.com passkey, same Base + paymaster support.
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  multiInjectedProviderDiscovery: false,
  connectors: [
    coinbaseWallet({ appName: "Salvadanaio", preference: "smartWalletOnly" }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

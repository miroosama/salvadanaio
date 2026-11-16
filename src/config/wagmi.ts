import { createConfig, createStorage, cookieStorage, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

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
    // Primary: Coinbase Smart Wallet (passkey) — the no-seed-phrase onboarding.
    coinbaseWallet({ appName: "Salvadanaio", preference: "smartWalletOnly" }),
    // Wallet freedom (IN): let crypto-natives connect their own wallet (MetaMask,
    // Rabby, any injected EIP-1193). Also the chain that works on testnet, since
    // Coinbase Smart Wallet can't transact on Base Sepolia (bug base/account-sdk#363).
    injected(),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

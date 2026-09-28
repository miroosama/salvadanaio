/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Stub optional peer deps pulled in transitively by the Coinbase
    // connector (x402, async-storage) that this app doesn't use.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      '@x402/evm': false,
      '@x402/svm': false,
      '@x402/core': false,
      '@x402/core/client': false,
    };
    return config;
  },
};

module.exports = nextConfig;

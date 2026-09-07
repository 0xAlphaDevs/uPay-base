/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@upay/sdk"],
  webpack: (config) => {
    // wagmi/connectors bundles a Coinbase "Base Account" connector whose
    // @coinbase/cdp-sdk -> @x402/evm dependency chain is broken on the
    // currently published versions. We don't use that connector (Reown +
    // injected/WalletConnect cover wallet connection here) — skip bundling it.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@coinbase/cdp-sdk": false,
      "@base-org/account": false,
    };
    return config;
  },
};

module.exports = nextConfig;

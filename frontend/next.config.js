/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly transpile @radix-ui/react-toast to ensure proper module resolution
  transpilePackages: ["@radix-ui/react-toast"],
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {},
  // ESLint configuration
  eslint: {
    // Disable ESLint during builds (we run it separately in CI)
    ignoreDuringBuilds: false,
    // Specify directories to lint
    dirs: ["app", "components", "lib"],
  },
  // Webpack configuration for compatibility (when not using Turbopack)
  webpack: (config, { isServer }) => {
    // Fix module resolution for packages using "exports" field
    config.resolve.conditionNames = ["require", "node", "default"];

    // Ensure proper resolution of @radix-ui packages
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    return config;
  },
};

module.exports = nextConfig;

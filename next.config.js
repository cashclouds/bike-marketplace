/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /compression/ },
      { module: /express/ },
    ];
    return config;
  },
}

module.exports = nextConfig

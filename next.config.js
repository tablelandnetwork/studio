/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        // crypto: require.resolve("crypto-browserify"),
      };
    }
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      "uglify-js": "uglify-js",
      "mjml-core": "mjml-core",
      "mailing-core": "mailing-core",
    });
    return config;
  },
};

module.exports = nextConfig;

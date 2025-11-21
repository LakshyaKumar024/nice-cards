import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // 1. Prevent Webpack from bundling native canvas.node files
    config.externals.push({
      canvas: "commonjs canvas",
    });

    // 2. Force pdfjs-dist to use your root canvas installation
    config.resolve.alias["canvas"] = require.resolve("canvas");

    // 3. Ignore all .node binaries (like canvas.node)
    config.module.rules.push({
      test: /\.node$/,
      loader: "null-loader",
    });

    return config;
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;

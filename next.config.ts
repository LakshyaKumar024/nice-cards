import type { NextConfig } from "next";

// Suppress Node.js runtime deprecation warnings (e.g. DEP0205 module.register in newer Node versions)
if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
  const originalEmitWarning = process.emitWarning;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process.emitWarning = function (warning: any, ...args: any[]) {
    if (
      (typeof warning === "string" &&
        (warning.includes("DEP0205") || warning.includes("module.register"))) ||
      (warning && warning.code === "DEP0205") ||
      args.includes("DEP0205")
    ) {
      return;
    }
    return originalEmitWarning.apply(process, [warning, ...args] as [any, ...any[]]);
  };
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "canvas"],

  outputFileTracingIncludes: {
    "/api/**/*": [
      "./prisma/generated/prisma/**/*",
      "./node_modules/.prisma/client/**/*",
    ],
    "/*": [
      "./prisma/generated/prisma/**/*",
      "./node_modules/.prisma/client/**/*",
    ],
  },

  webpack: (config) => {
    // 1. Prevent Webpack from bundling native canvas.node files
    config.externals.push({
      canvas: "commonjs canvas",
    });

    // 2. Force pdfjs-dist to use your root canvas installation
    config.resolve.alias["canvas"] = require.resolve("canvas");

    // 3. Ignore ONLY canvas.node binary (DO NOT match Prisma's query_engine .node binaries)
    config.module.rules.push({
      test: /canvas\.node$/,
      loader: "null-loader",
    });

    return config;
  },

  async rewrites() {
    return [
      {
        source: "/upload/:path*",
        destination: "/api/upload/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;

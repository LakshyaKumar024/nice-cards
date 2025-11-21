import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal Turbopack config to avoid build error when custom webpack is present
  
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Only apply these fixes on the server side
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use the non-legacy build of pdfjs
        'pdfjs-dist': 'pdfjs-dist/build/pdf',
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'img.clerk.com',
      }, {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ],
  },
};

export default nextConfig;
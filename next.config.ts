import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Only apply these fixes on the server side
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist': 'pdfjs-dist/legacy/build/pdf',
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
      }
    ],
  },
};


export default nextConfig;
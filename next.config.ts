import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  assetPrefix: process.env.DEV_TUNNEL_URL || "",
  allowedDevOrigins: ["*"],
  experimental: {
    serverActions:{
      allowedOrigins:["*"]
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'img.clerk.com',
        port: '',
        pathname: '**',
      }
    ],
  },
};


export default nextConfig;
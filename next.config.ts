import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname:
          "cloudflare-test.c23c892e9dc53ace8666a60e4429c275.r2.cloudflarestorage.com",
      },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;

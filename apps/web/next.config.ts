import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@latios/ui'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/:path*', // Proxy to Backend (IPv4 to avoid ECONNREFUSED)
      },
    ];
  },
};


export default nextConfig;

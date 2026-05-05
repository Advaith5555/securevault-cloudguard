import type { NextConfig } from "next";

const upstream =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

const nextConfig: NextConfig = {
  // Monorepo / multiple lockfiles: keep tracing anchored to this app when building from frontend/
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      {
        source: "/__upstream/:path*",
        destination: `${upstream}/:path*`,
      },
    ];
  },
};

export default nextConfig;

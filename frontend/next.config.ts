import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/users/:path*",
        destination: `${process.env.USER_SERVICE_URL || "http://localhost:8000"}/api/v1/users/:path*`,
      },
      {
        source: "/api/v1/auth/:path*",
        destination: `${process.env.USER_SERVICE_URL || "http://localhost:8000"}/api/v1/auth/:path*`,
      },
      {
        source: "/api/v1/finance/:path*",
        destination: `${process.env.FINANCE_SERVICE_URL || "http://localhost:8001"}/api/v1/finance/:path*`,
      },
      {
        source: "/api/v1/ml/:path*",
        destination: `${process.env.ML_SERVICE_URL || "http://localhost:8002"}/api/v1/ml/:path*`,
      },
      {
        source: "/api/v1/agent/:path*",
        destination: `${process.env.AGENT_SERVICE_URL || "http://localhost:8004"}/api/v1/agent/:path*`,
      },
    ];
  },
};

export default nextConfig;

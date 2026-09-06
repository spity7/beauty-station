import type { NextConfig } from "next";

/**
 * Subdomain deploy (e.g. admin.beautystation.com): leave NEXT_PUBLIC_BASE_URL unset.
 * Path deploy (e.g. example.com/admin): set NEXT_PUBLIC_BASE_URL=/admin
 */
const basePath = process.env.NEXT_PUBLIC_BASE_URL?.trim();

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  transpilePackages: ["@platform/shared", "@platform/site-config"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

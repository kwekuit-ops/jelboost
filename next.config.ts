import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "") || "",
      ].filter(Boolean),
    },
  },
  // Suppress build warnings for packages that use "use client" with server components
  typescript: {
    // Allows production builds even with TS errors (use for deployment only)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

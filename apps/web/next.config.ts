import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  transpilePackages: ["@bizaffle/types", "@heygen/streaming-avatar"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

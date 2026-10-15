import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;

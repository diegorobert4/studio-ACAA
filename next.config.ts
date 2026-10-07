import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 solo admite las calidades listadas; 90 se usa en ProjectSection (si no, se redondea a 75).
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;

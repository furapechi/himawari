import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // Enable the move only after DNS/TLS is ready and the public URL is switched.
    if (process.env.NEXT_PUBLIC_SITE_URL !== "https://himawari-fc.jp") {
      return [];
    }

    return [
      {
        source: "/:path((?!api(?:/|$)).*)",
        has: [{ type: "host", value: "himawari-web-production.up.railway.app" }],
        destination: "https://himawari-fc.jp/:path",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ひまわりFC｜我孫子の児童発達支援・放課後等デイサービス",
    template: "%s｜ひまわりFC",
  },
  description:
    "千葉県我孫子市の児童発達支援・放課後等デイサービス、ひまわりFC。サッカーを中心とした運動療育で、社会性・コミュニケーション能力・自己肯定感を育みます。",
  keywords: [
    "ひまわりFC",
    "我孫子",
    "児童発達支援",
    "放課後等デイサービス",
    "運動療育",
    "サッカー療育",
  ],
  authors: [{ name: "株式会社ひまわり園" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ひまわりFC",
    title: "ひまわりFC｜サッカーで伸ばす、一人ひとりの「できた！」",
    description: "我孫子の児童発達支援・放課後等デイサービス。サッカーを中心に、一人ひとりの可能性を育みます。",
    images: [{ url: "/images/hero-soccer-v2.webp", width: 1254, height: 1254, alt: "ひまわりFCのサッカー療育イメージ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ひまわりFC｜サッカーで伸ばす、一人ひとりの「できた！」",
    description: "我孫子の児童発達支援・放課後等デイサービス",
    images: ["/images/hero-soccer-v2.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffaf0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

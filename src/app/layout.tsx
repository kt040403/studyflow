import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StudyFlow - AI学習記録＆進捗管理アプリ",
    template: "%s | StudyFlow",
  },
  description:
    "AIがあなたの学習パートナーになる。目標を設定するだけで、AIが最適な学習計画を自動生成し、日々の進捗を可視化する学習管理アプリ。",
  keywords: [
    "学習管理",
    "AI",
    "学習計画",
    "進捗管理",
    "目標管理",
    "学習記録",
    "プログラミング学習",
    "語学学習",
    "資格勉強",
  ],
  authors: [{ name: "StudyFlow" }],
  creator: "StudyFlow",
  publisher: "StudyFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    title: "StudyFlow - AI学習記録＆進捗管理アプリ",
    description:
      "AIがあなたの学習パートナーになる。目標を設定するだけで、AIが最適な学習計画を自動生成し、日々の進捗を可視化する学習管理アプリ。",
    siteName: "StudyFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StudyFlow - AI学習記録＆進捗管理アプリ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyFlow - AI学習記録＆進捗管理アプリ",
    description:
      "AIがあなたの学習パートナーになる。目標を設定するだけで、AIが最適な学習計画を自動生成。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

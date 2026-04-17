import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d1d1f",
};

export const metadata: Metadata = {
  title: "Swipe — AI Concierge Dubai",
  description: "Find the best restaurants, homes, cars, gyms and more in Dubai. Just ask.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Swipe",
  },
  icons: {
    apple: "/icon-192.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className="bg-bg min-h-screen overflow-hidden">{children}</body>
    </html>
  );
}

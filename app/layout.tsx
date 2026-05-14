import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "@/components/ui/toaster";
import { DataInitializer } from "@/components/DataInitializer";
import { PWAInstaller } from "@/components/PWAInstaller";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Mode de Vie | Système Personnel",
  description: "Ton système quotidien pour devenir la meilleure version de toi-même",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mode de Vie",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <DataInitializer />
        <PWAInstaller />
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

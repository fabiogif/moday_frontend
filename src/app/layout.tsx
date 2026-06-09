import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { AuthProvider } from "@/contexts/auth-context";
import { inter } from "@/lib/fonts";
import { ToasterProvider } from "@/components/toaster-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  GoogleTagManagerNoscript,
  GoogleTagManagerScript,
} from "@/components/google-tag-manager";

export const metadata: Metadata = {
  title: "Alba Tec - Gestão",
  description: "Sistema de gestão para restaurantes",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleTagManagerScript />
        <GoogleTagManagerNoscript />
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <AuthProvider>
            <SidebarConfigProvider>
              {children}
              <ToasterProvider />
            </SidebarConfigProvider>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

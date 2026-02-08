import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import DebugLogger from "@/components/DebugLogger";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { TelegramProvider } from "@/components/TelegramProvider";

export const metadata: Metadata = {
  title: "GoBoop",
  description: "Интеллектуальная экосистема для заботы о питомце",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GoBoop",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#121212",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        {/* Telegram Mini App SDK — must load before React hydrates */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <TelegramProvider>
            <ServiceWorkerRegistrar />
            <DebugLogger />
            {children}
            <Analytics />
            <SpeedInsights />
          </TelegramProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

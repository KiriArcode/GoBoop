import type { Metadata } from "next";
import "./globals.css";
import DebugLogger from "@/components/DebugLogger";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const basePath = process.env.NODE_ENV === "production" ? "/GoBoop" : "";

export const metadata: Metadata = {
  title: "GoBoop",
  description: "Интеллектуальная экосистема для заботы о питомце",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#121212",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GoBoop",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/icons/icon-192.svg`} />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegistrar />
        <DebugLogger />
        {children}
      </body>
    </html>
  );
}

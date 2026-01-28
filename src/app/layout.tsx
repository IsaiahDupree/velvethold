import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { PostHogIdentitySync } from "@/components/analytics/posthog-identity-sync";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { AnalyticsInit } from "@/components/analytics/analytics-init";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VelvetHold - Premium Date Reservations",
  description: "Premium date reservation platform with deposit-based commitment",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <MetaPixel />
      </head>
      <body className={inter.className}>
        <PostHogProvider>
          <SessionProvider session={session}>
            <PostHogIdentitySync />
            <AnalyticsInit />
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </SessionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}

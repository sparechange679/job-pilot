import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogIdentity } from "@/components/providers/PostHogProvider";
import PostHogPageView from "@/components/providers/PostHogPageView";
import React, { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "JobPilot - AI-Powered Job Hunting Assistant",
  description: "JobPilot finds the jobs, researches the companies, and gives you everything you need to stand out.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
    <head>
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <title>JobPilot - AI-Powered Job Hunting Assistant</title>
    </head>
      <body className="min-h-screen bg-background text-text-primary font-sans" suppressHydrationWarning>
        <PostHogIdentity>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogIdentity>
      </body>
    </html>
  );
}

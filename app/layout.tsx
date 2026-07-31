import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/src/index.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KINDRA — Civic Engagement Platform",
  description: '"Make Kindness Count." 💚 — Gamified Civic Engagement Platform',
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased bg-background text-on-surface min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

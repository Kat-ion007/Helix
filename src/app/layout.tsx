import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Helix | Customer Support Admin Portal",
  description: "High-speed B2B customer support admin panel with real-time ticket updates and metrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-surface text-text-primary selection:bg-accent/30 font-sans" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-accent focus:text-text-primary focus:rounded focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Skip to main content
        </a>
        
        {/* Global accessibility live region for dynamic updates */}
        <div id="announcement-region" aria-live="polite" className="sr-only" />
        
        {children}
      </body>
    </html>
  );
}

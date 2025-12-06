import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./fonts.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";
import Script from "next/script";
import ShadcnFooter from "@/components/footer";

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
    default: "Nice Card – Online Invitation Card Maker & Store",
    template: "%s – Nice Card",
  },
  description:
    "Nice Card is an e-commerce platform where you can browse, customize, and purchase beautiful invitation card designs online. Create wedding, birthday, engagement, and all event cards directly on the website with easy-to-use design tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/ARENSKI.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <ClerkProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <Script
            id="razorpay-checkout-script"
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
          />

          <Providers>
            <Navbar />
            <Toaster richColors />
            {children}
            <ShadcnFooter />
          </Providers>
        </body>
      </ClerkProvider>
    </html>
  );
}

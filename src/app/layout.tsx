import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSync from "@/components/CartSync";

import { Providers } from "@/components/shared/Providers";
import { UserNotificationProvider } from "@/context/UserNotificationContext";

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
    template: "%s | Telugu Experiments",
    default: "Telugu Experiments | Science Kits & Gadgets"
  },
  description: "Shop for original science experiment kits, gadgets, and educational toys in India. Discover innovation with Telugu Experiments.",
  keywords: "science kits, experiments, gadgets, toys, india, educational toys",
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: "Telugu Experiments | Science Kits & Gadgets",
    description: "Shop for original science experiment kits, gadgets, and educational toys in India.",
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Telugu Experiments | Science Kits & Gadgets",
    description: "Shop for original science experiment kits, gadgets, and educational toys in India.",
    images: ['/logo.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <UserNotificationProvider> {/* Added UserNotificationProvider */}
            <CartSync />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="grow">
                {children}
              </main>
              <Footer />
            </div>
          </UserNotificationProvider> {/* Closing tag for UserNotificationProvider */}
        </Providers>
      </body>
    </html>
  );
}

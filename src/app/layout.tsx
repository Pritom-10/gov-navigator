import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "সরকারি সেবা নেভিগেটর",
  description: "সাধারণ ভাষায় সমস্যা লিখলে সরকারি সেবার ধাপ, কাগজ আর আবেদনপত্রের খসড়া পাওয়া যাবে",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={noto.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
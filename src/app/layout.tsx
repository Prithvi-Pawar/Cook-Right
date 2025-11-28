import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cook Right | AI Recipe Generator',
  description: 'Your AI-powered culinary assistant. Generate unique recipes from a description, or find creative ways to use the ingredients you already have in your fridge. Start cooking with AI today!',
  keywords: [
    "AI recipe generator",
    "recipe generator from ingredients",
    "custom recipe maker", "cooking AI", "meal ideas", "what to cook"
  ],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <Header />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}

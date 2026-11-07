// /src/app/layout.jsx

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import StoreProvider from "@/components/StoreProvider";
import CartPersistence from "@/components/CartPersistence";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Redux E-Commerce Store",
  description: "Next.js, Redux Toolkit, Prisma 7 and Stripe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <CartPersistence>
            <header className="flex justify-between border-b p-6">
              <Link href="/" className="font-bold">
                Redux Store
              </Link>

              <Link href="/cart">
                Shopping Cart
              </Link>
            </header>

            {children}
          </CartPersistence>
        </StoreProvider>
      </body>
    </html>
  );
}
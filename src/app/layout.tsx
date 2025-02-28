import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "./components/shop/Navbar";
import { Toaster } from "react-hot-toast";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "House of Kimani",
  description: "Your one-stop shop for quality products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <Toaster position="top-center" />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "./contexts/AuthProvider";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "House of Kimani",
  description: "Shop the latest fashion trends",
  icons: {
    icon: [{ url: "/HouseOfKimaniLogo.jpg", type: "image/jpeg" }],
    apple: [{ url: "/HouseOfKimaniLogo.jpg", type: "image/jpeg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-center" />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

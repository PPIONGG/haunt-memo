import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sans = Noto_Sans_Thai({
  variable: "--font-thai-sans",
  subsets: ["thai", "latin"],
});

const serif = Noto_Serif_Thai({
  variable: "--font-thai-serif",
  subsets: ["thai", "latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Haunt Memo — คลังเรื่องผี The Ghost Radio",
  description: "คลังเรื่องผีคัดสรรจากรายการ The Ghost Radio ค้นหา กรอง และสุ่มฟังได้ทันที",
};

export const viewport: Viewport = {
  themeColor: "#0b0a10",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`dark ${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}

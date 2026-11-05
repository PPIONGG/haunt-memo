import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Haunt Memo — เรื่องผีที่คัดมาจาก YouTube",
  description: "เรื่องผีที่คัดมาจากรายการเล่าเรื่องผีบน YouTube ดูบนแผนที่ว่าเกิดที่ไหน ค้นหา และสุ่มฟังได้ทันที",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`dark ${kanit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}

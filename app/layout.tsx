import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";

export const metadata: Metadata = {
  title: "보컬 레슨 스케줄러",
  description: "보컬 트레이너 레슨 관리 시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

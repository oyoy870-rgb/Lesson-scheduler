import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
import MobileNav from "@/components/ui/MobileNav";

export const metadata: Metadata = {
  title: "레슨 스케줄러",
  description: "보컬 트레이너 레슨 관리 시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="flex h-screen bg-gray-50">
          {/* PC 사이드바 */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>
          {/* 콘텐츠 */}
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
        {/* 모바일 하단 탭바 */}
        <MobileNav />
      </body>
    </html>
  );
}

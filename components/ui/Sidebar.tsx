"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, Music, Sun } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/today", label: "오늘 스케줄", icon: Sun },
  { href: "/calendar", label: "캘린더", icon: Calendar },
  { href: "/students", label: "학생 관리", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">레슨 스케줄러</p>
            <p className="text-xs text-gray-500">Vocal Trainer</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-sky-50 text-sky-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

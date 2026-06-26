"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, Sun } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/today", label: "오늘", icon: Sun },
  { href: "/calendar", label: "캘린더", icon: Calendar },
  { href: "/students", label: "학생", icon: Users },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors",
              pathname.startsWith(href) ? "text-sky-600" : "text-gray-400"
            )}>
            <Icon className={clsx("w-5 h-5", pathname.startsWith(href) ? "text-sky-600" : "text-gray-400")} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

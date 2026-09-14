"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navLink = (href: string, label: string, icon: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
          active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        <span>{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 pt-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl">⏰</span>
        <span className="text-base font-extrabold tracking-tight text-slate-900">DEV REMINDER</span>
      </Link>
      <nav className="flex items-center gap-2">
        {navLink("/calendar", "Calendar", "📅")}
        {navLink("/settings", "Settings", "⚙")}
      </nav>
    </header>
  );
}

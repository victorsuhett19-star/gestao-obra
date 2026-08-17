"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ObraTabs({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-slate-200">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
              active
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

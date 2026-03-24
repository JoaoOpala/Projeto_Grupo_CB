"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLink {
  label: string;
  href: string;
}

interface SidebarProps {
  title: string;
  links: SidebarLink[];
}

export function Sidebar({ title, links }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r bg-card p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <nav className="mt-6 flex flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== links[0]?.href && pathname.startsWith(link.href + "/"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

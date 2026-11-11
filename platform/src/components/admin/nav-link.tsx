"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

import { cn } from "@/lib/utils";

/** Lenke i menyen. Markerer aktiv side for både øyet og skjermlesere (aria-current). */
export function NavLink({ href, exact = false, children }: { href: string; exact?: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

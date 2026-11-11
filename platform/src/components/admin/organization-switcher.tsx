"use client";

import { Building2Icon, CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrganizationSwitcher({
  current,
  organizations,
  labels,
}: {
  current: { name: string; slug: string } | null;
  organizations: { name: string; slug: string }[];
  labels: { switch: string; create: string; fallback: string };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="max-w-64 justify-between gap-2 px-2" aria-label={labels.switch}>
          <Building2Icon aria-hidden="true" />
          <span className="truncate font-semibold">{current?.name ?? labels.fallback}</span>
          <ChevronsUpDownIcon className="opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{labels.switch}</DropdownMenuLabel>
        {organizations.map((organization) => (
          <DropdownMenuItem key={organization.slug} asChild>
            <Link href={`/${organization.slug}`}>
              <span className="truncate">{organization.name}</span>
              {organization.slug === current?.slug ? <CheckIcon className="ml-auto" aria-hidden="true" /> : null}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding">
            <PlusIcon aria-hidden="true" />
            {labels.create}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

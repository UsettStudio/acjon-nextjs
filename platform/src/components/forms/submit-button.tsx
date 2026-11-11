"use client";

import { LoaderCircleIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  pending,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? <LoaderCircleIcon className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}

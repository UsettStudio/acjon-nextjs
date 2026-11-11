"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Felt med etikett, hjelpetekst og feilmelding, koblet sammen med aria-attributter
 * slik at skjermlesere leser opp hjelpetekst og feil.
 *
 * Id-en lages med useId(). Next.js beholder tidligere sider skjult i DOM-en
 * (Cache Components bruker React Activity), så faste id-er som «email» kunne
 * ellers finnes flere ganger og koble etiketten til feil felt.
 */
function Field({
  name,
  label,
  description,
  error,
  className,
  children,
}: {
  name: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  className?: string;
  children: (controlProps: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}) {
  const id = `${name}-${React.useId()}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {description ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Field };

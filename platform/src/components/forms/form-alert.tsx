import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function FormAlert({ message, variant = "error" }: { message: string | null; variant?: "error" | "success" }) {
  if (!message) {
    return null;
  }
  return (
    <Alert variant={variant === "error" ? "destructive" : "default"} aria-live="polite">
      {variant === "error" ? <CircleAlertIcon aria-hidden="true" /> : <CircleCheckIcon aria-hidden="true" />}
      <AlertDescription className={variant === "error" ? undefined : "text-foreground"}>{message}</AlertDescription>
    </Alert>
  );
}

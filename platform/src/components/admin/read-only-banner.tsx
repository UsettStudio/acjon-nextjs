import { InfoIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

/** Vises når abonnementet er utløpt. Databasen avviser uansett alle endringer. */
export async function ReadOnlyBanner() {
  const t = await getTranslations("common");
  return (
    <div role="status" className="border-b bg-warning/15">
      <p className="mx-auto flex max-w-[96rem] items-center gap-2 px-4 py-2 text-sm">
        <InfoIcon className="size-4 shrink-0" aria-hidden="true" />
        {t("readOnly")}
      </p>
    </div>
  );
}

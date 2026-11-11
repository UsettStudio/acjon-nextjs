import { getRequestConfig } from "next-intl/server";

import { defaultLocale } from "@/i18n/config";

/**
 * Admin bruker standardspråket. Språket leses ikke fra cookies eller hoder, slik
 * at oversatt tekst kan være del av det forhåndsrenderte skallet (Cache Components).
 * Publiserte prosjektsider (fase 3) henter språket fra organisasjonen.
 */
export default getRequestConfig(async () => {
  const locale = defaultLocale;
  return {
    locale,
    timeZone: "Europe/Oslo",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

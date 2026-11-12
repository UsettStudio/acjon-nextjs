"use client";

import { Loader2Icon, MapPinIcon, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchAddresses, type AddressSuggestion } from "@/features/projects/kartverket";
import { cn } from "@/lib/utils";

type SearchState = {
  query: string;
  status: "loading" | "done" | "error";
  results: AddressSuggestion[];
};

const MIN_LENGTH = 3;

/**
 * Adressesøk mot Kartverket som kombinasjonsboks (ARIA 1.2): piltaster flytter,
 * Enter velger og Escape lukker. Antall treff leses opp av skjermlesere.
 */
export function AddressSearch({ onSelect }: { onSelect: (suggestion: AddressSuggestion) => void }) {
  const t = useTranslations("projects.location");
  const id = useId();
  const listboxId = `${id}-listbox`;
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const trimmed = query.trim();
  const tooShort = trimmed.length < MIN_LENGTH;

  useEffect(() => {
    if (trimmed.length < MIN_LENGTH) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearch({ query: trimmed, status: "loading", results: [] });
      try {
        const results = await searchAddresses(trimmed, controller.signal);
        setSearch({ query: trimmed, status: "done", results });
        setActive(-1);
      } catch {
        if (!controller.signal.aborted) {
          setSearch({ query: trimmed, status: "error", results: [] });
        }
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  const current = !tooShort && search?.query === trimmed ? search : null;
  const results = current?.results ?? [];
  const expanded = open && !tooShort && current !== null;

  function choose(suggestion: AddressSuggestion) {
    onSelect(suggestion);
    setQuery(suggestion.label);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (results.length === 0 ? -1 : (index + 1) % results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (results.length === 0 ? -1 : index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      const suggestion = results[active];
      if (expanded && suggestion) {
        event.preventDefault();
        choose(suggestion);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  let statusText = "";
  if (!tooShort && current?.status === "done") {
    statusText = results.length === 0 ? t("noResults") : t("resultCount", { count: results.length });
  } else if (!tooShort && current?.status === "error") {
    statusText = t("searchFailed");
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${id}-input`}>{t("search")}</Label>
      <div className="relative">
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={`${id}-input`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-activedescendant={expanded && active >= 0 ? `${id}-option-${active}` : undefined}
          aria-describedby={`${id}-help ${id}-status`}
          autoComplete="off"
          className="pl-9"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder={t("searchPlaceholder")}
        />
        {current?.status === "loading" ? (
          <Loader2Icon aria-hidden="true" className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t("suggestions")}
          hidden={!expanded || results.length === 0}
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {results.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === active}
              className={cn(
                "flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm",
                index === active && "bg-accent text-accent-foreground",
              )}
              // mousedown, ikke click: feltet mister ellers fokus og listen lukkes før valget registreres.
              onMouseDown={(event) => {
                event.preventDefault();
                choose(suggestion);
              }}
              onMouseEnter={() => setActive(index)}
            >
              <MapPinIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                {suggestion.address}
                <span className="block text-xs text-muted-foreground">
                  {[suggestion.postalCode, suggestion.city].filter(Boolean).join(" ")}
                  {suggestion.municipality && suggestion.municipality !== suggestion.city
                    ? ` · ${suggestion.municipality}`
                    : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p id={`${id}-help`} className="text-sm text-muted-foreground">
        {t("searchHelp")}
      </p>
      <p
        id={`${id}-status`}
        aria-live="polite"
        className={cn("text-sm", current?.status === "error" ? "text-destructive" : "sr-only")}
      >
        {statusText}
      </p>
    </div>
  );
}

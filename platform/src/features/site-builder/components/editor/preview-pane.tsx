"use client";

import { MonitorIcon, RefreshCwIcon, SmartphoneIcon, TabletIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { PreviewEvent, PreviewUpdate } from "@/features/site-builder/components/preview-frame";
import { cn } from "@/lib/utils";

const DEVICES = { desktop: "100%", tablet: "820px", mobile: "390px" } as const;
type Device = keyof typeof DEVICES;

/**
 * Forhåndsvisningen ved siden av skjemaene. Rammen laster utkastet én gang og
 * får deretter hver endring som en melding, så den oppdateres uten å lastes på nytt.
 */
export function PreviewPane({
  siteId,
  update,
  onSelectBlock,
  onNavigate,
}: {
  siteId: string;
  update: PreviewUpdate;
  onSelectBlock: (blockId: string) => void;
  onNavigate: (pageId: string) => void;
}) {
  const t = useTranslations("siteBuilder.editor.preview");
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const latest = useRef({ update, onSelectBlock, onNavigate });

  useEffect(() => {
    latest.current = { update, onSelectBlock, onNavigate };
  });

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || !frame.current || event.source !== frame.current.contentWindow) {
        return;
      }
      const message = event.data as PreviewEvent | undefined;
      switch (message?.type) {
        case "site-preview:ready":
          setReady(true);
          frame.current.contentWindow?.postMessage(latest.current.update, window.location.origin);
          break;
        case "site-preview:select":
          latest.current.onSelectBlock(message.blockId);
          break;
        case "site-preview:navigate":
          latest.current.onNavigate(message.pageId);
          break;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready) {
      frame.current?.contentWindow?.postMessage(update, window.location.origin);
    }
  }, [ready, update]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label={t("device")} className="flex gap-1 rounded-md bg-muted p-1">
          {(Object.keys(DEVICES) as Device[]).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={device === option}
              onClick={() => setDevice(option)}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                device === option && "bg-background text-foreground shadow-sm",
              )}
            >
              {option === "desktop" ? (
                <MonitorIcon className="size-4" aria-hidden="true" />
              ) : option === "tablet" ? (
                <TabletIcon className="size-4" aria-hidden="true" />
              ) : (
                <SmartphoneIcon className="size-4" aria-hidden="true" />
              )}
              {t(option)}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setReady(false);
            setReloadKey((key) => key + 1);
          }}
        >
          <RefreshCwIcon aria-hidden="true" />
          {t("reload")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
      </div>
      <div className="flex min-h-[32rem] flex-1 justify-center overflow-auto rounded-md border bg-muted/50 p-2">
        <iframe
          key={reloadKey}
          ref={frame}
          title={t("frameTitle")}
          src={`/site-preview/${siteId}`}
          style={{ width: DEVICES[device] }}
          className="h-full min-h-[32rem] shrink-0 rounded border bg-white"
        />
      </div>
    </div>
  );
}

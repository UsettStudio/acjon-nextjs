import "server-only";

import { cache } from "react";
import { z } from "zod";

import { parsePublicUnitDetail, parsePublishedSelector, type PublicUnitDetail, type PublishedSelector } from "@/features/selector/model";
import { postgresErrorCode } from "@/lib/actions/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

const uuid = z.uuid();

/** Den publiserte velgeren, slik kjøpere ser den. null hvis den ikke finnes eller ikke er publisert. */
export const getPublishedSelector = cache(async (selectorId: string): Promise<PublishedSelector | null> => {
  if (!uuid.safeParse(selectorId).success) {
    return null;
  }
  const supabase = await createPublicClient();
  const { data, error } = await supabase.rpc("get_published_selector", { p_selector_id: selectorId });
  if (error) {
    throw error;
  }
  return parsePublishedSelector(data);
});

/**
 * Utkastet, slik det blir publisert. Bare for innloggede med tilgang til
 * prosjektet (forhåndsvisning i editoren). null uten tilgang.
 */
export const getSelectorPreview = cache(async (selectorId: string): Promise<PublishedSelector | null> => {
  if (!uuid.safeParse(selectorId).success) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_selector_preview", { p_selector_id: selectorId });
  if (error) {
    const code = postgresErrorCode(error);
    if (code === "42501" || code === "PGRST202") {
      return null;
    }
    throw error;
  }
  return parsePublishedSelector(data);
});

/** En enhet i prosjektet til en publisert velger (enhetssiden). */
export const getSelectorUnit = cache(
  async (selectorId: string, slug: string): Promise<{ unit: PublicUnitDetail; projectId: string } | null> => {
    if (!uuid.safeParse(selectorId).success || slug.length === 0 || slug.length > 200) {
      return null;
    }
    const supabase = await createPublicClient();
    const { data: projectId, error } = await supabase.rpc("get_published_selector_project", { p_selector_id: selectorId });
    if (error) {
      throw error;
    }
    if (typeof projectId !== "string") {
      return null;
    }
    const { data, error: unitError } = await supabase.rpc("get_public_unit", { p_project_id: projectId, p_slug: slug });
    if (unitError) {
      throw unitError;
    }
    const unit = parsePublicUnitDetail(data);
    return unit ? { unit, projectId } : null;
  },
);

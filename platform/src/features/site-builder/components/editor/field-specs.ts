/**
 * Skjemaene for blokkene i editoren, beskrevet som data. Hvert felt peker på en
 * nøkkel i blokkens props. Selve valideringen skjer med blockPropsSchemas, så
 * skjemaet og lagringen alltid er enige om hva som er gyldig.
 *
 * Ledetekstene ligger under siteBuilder.editor.fields.{label ?? key}, hjelpetekster
 * under siteBuilder.editor.help.{help} og valgene under siteBuilder.editor.options.{options}.
 */

import { KEY_FIGURE_SOURCES, newBlockId, type BlockType } from "@/features/site-builder/blocks";

type Values = Record<string, unknown>;

type Common = {
  key: string;
  /** Annen ledetekst enn feltnøkkelen. */
  label?: string;
  help?: string;
  /** Feltet vises bare når betingelsen er oppfylt. */
  when?: (values: Values) => boolean;
};

export type FieldSpec = Common &
  (
    | { kind: "text"; max: number; inputType?: "text" | "url" | "email" | "tel"; placeholder?: string }
    | { kind: "textarea"; max: number; rows?: number }
    | { kind: "richtext"; max: number }
    | { kind: "select"; options: string; values: readonly (string | number)[] }
    | { kind: "range"; min: number; max: number; step: number; unit: "percent" | "px" | "zoom" }
    | { kind: "number"; min: number; max: number; step: number }
    | { kind: "boolean" }
    | { kind: "image" }
    | { kind: "assets"; assetKind: "image" | "document"; max: number }
    | { kind: "link"; required?: boolean }
    | { kind: "selector" }
    | { kind: "selectorView"; selectorKey: string }
    | { kind: "date"; optional?: boolean }
    | { kind: "time"; optional?: boolean }
    | {
        kind: "list";
        max: number;
        /** Feltene i hvert element. */
        fields: FieldSpec[];
        /** Feltene som gir elementet et navn i listen, i prioritert rekkefølge. */
        titleKeys: string[];
        /** Valget som navngir elementet når titleKeys er tomme, for eksempel kilden til et nøkkeltall. */
        titleOption?: { key: string; options: string };
        newItem: () => Values;
        addLabel: string;
      }
  );

const eyebrow: FieldSpec = { kind: "text", key: "eyebrow", max: 80, help: "eyebrow" };
const heading: FieldSpec = { kind: "text", key: "heading", max: 200 };

const notUsingProject = (values: Values) => values.use_project === false;

export const BLOCK_FIELDS: Record<BlockType, FieldSpec[]> = {
  hero: [
    eyebrow,
    { kind: "text", key: "title", label: "heroTitle", max: 200 },
    { kind: "textarea", key: "subtitle", max: 500, rows: 3 },
    { kind: "image", key: "image_asset_id", label: "backgroundImage", help: "heroImage" },
    { kind: "range", key: "overlay", min: 0, max: 80, step: 5, unit: "percent", help: "overlay", when: (values) => Boolean(values.image_asset_id) },
    { kind: "select", key: "height", options: "heroHeight", values: ["medium", "large", "full"] },
    { kind: "select", key: "align", options: "align", values: ["left", "center"] },
    { kind: "text", key: "cta_label", max: 80 },
    { kind: "link", key: "cta_link", when: (values) => typeof values.cta_label === "string" && values.cta_label.trim() !== "" },
    { kind: "boolean", key: "show_status", help: "showStatus" },
  ],
  text: [eyebrow, heading, { kind: "richtext", key: "body", max: 10000 }, { kind: "select", key: "width", options: "width", values: ["narrow", "wide"] }],
  text_image: [
    eyebrow,
    heading,
    { kind: "richtext", key: "body", max: 10000 },
    { kind: "image", key: "image_asset_id" },
    { kind: "select", key: "image_position", options: "imagePosition", values: ["left", "right"] },
  ],
  gallery: [
    eyebrow,
    heading,
    { kind: "assets", key: "asset_ids", label: "images", assetKind: "image", max: 60 },
    { kind: "select", key: "columns", options: "columns", values: [2, 3, 4] },
  ],
  key_figures: [
    eyebrow,
    heading,
    {
      kind: "list",
      key: "items",
      label: "figures",
      help: "keyFigures",
      max: 8,
      titleKeys: ["label", "value"],
      titleOption: { key: "source", options: "figureSource" },
      addLabel: "addFigure",
      newItem: () => ({ source: "custom", value: "", label: "" }),
      fields: [
        { kind: "select", key: "source", options: "figureSource", values: KEY_FIGURE_SOURCES },
        { kind: "text", key: "value", label: "figureValue", max: 40, when: (values) => values.source === "custom" },
        { kind: "text", key: "label", label: "figureLabel", max: 80, when: (values) => values.source === "custom" },
      ],
    },
  ],
  progress: [
    eyebrow,
    heading,
    { kind: "boolean", key: "use_project", label: "useProjectMilestones", help: "useProjectMilestones" },
    {
      kind: "list",
      key: "items",
      label: "milestones",
      max: 12,
      titleKeys: ["label", "text"],
      addLabel: "addMilestone",
      newItem: () => ({ label: "", text: "", done: false }),
      when: notUsingProject,
      fields: [
        { kind: "text", key: "label", label: "milestoneLabel", max: 100 },
        { kind: "text", key: "text", label: "milestoneText", max: 100, placeholder: "milestoneText" },
        { kind: "boolean", key: "done", label: "milestoneDone" },
      ],
    },
  ],
  selector: [
    eyebrow,
    heading,
    { kind: "selector", key: "selector_id", help: "selector" },
    { kind: "selectorView", key: "entry_view_id", selectorKey: "selector_id", help: "entryView", when: (values) => Boolean(values.selector_id) },
    { kind: "boolean", key: "show_filters" },
    { kind: "boolean", key: "show_list" },
  ],
  unit_list: [eyebrow, heading, { kind: "boolean", key: "show_filters" }, { kind: "boolean", key: "hide_sold" }],
  map: [
    eyebrow,
    heading,
    { kind: "boolean", key: "use_project_location", help: "useProjectLocation" },
    { kind: "number", key: "lat", min: -90, max: 90, step: 0.000001, when: (values) => values.use_project_location === false },
    { kind: "number", key: "lng", min: -180, max: 180, step: 0.000001, when: (values) => values.use_project_location === false },
    { kind: "range", key: "zoom", min: 8, max: 18, step: 1, unit: "zoom" },
    {
      kind: "list",
      key: "places",
      max: 30,
      titleKeys: ["name", "category"],
      addLabel: "addPlace",
      help: "places",
      newItem: () => ({ name: "", category: "", distance: "" }),
      fields: [
        { kind: "text", key: "name", label: "placeName", max: 100 },
        { kind: "text", key: "category", label: "placeCategory", max: 60, placeholder: "placeCategory" },
        { kind: "text", key: "distance", label: "placeDistance", max: 40, placeholder: "placeDistance" },
      ],
    },
  ],
  viewings: [
    eyebrow,
    heading,
    { kind: "textarea", key: "intro", max: 1000, rows: 3 },
    {
      kind: "list",
      key: "items",
      label: "viewingItems",
      max: 20,
      titleKeys: ["date", "start"],
      addLabel: "addViewing",
      newItem: () => ({ date: new Date().toISOString().slice(0, 10), start: "12:00", end: "13:00", note: "" }),
      fields: [
        { kind: "date", key: "date" },
        { kind: "time", key: "start" },
        { kind: "time", key: "end", optional: true },
        { kind: "text", key: "note", max: 200, placeholder: "viewingNote" },
      ],
    },
  ],
  contacts: [
    eyebrow,
    heading,
    { kind: "boolean", key: "use_project", label: "useProjectContacts", help: "useProjectContacts" },
    {
      kind: "list",
      key: "items",
      label: "contactItems",
      max: 12,
      titleKeys: ["name", "title"],
      addLabel: "addContact",
      newItem: () => ({ name: "", title: "", phone: "", email: "", image_asset_id: null }),
      when: notUsingProject,
      fields: [
        { kind: "text", key: "name", label: "contactName", max: 100 },
        { kind: "text", key: "title", label: "contactTitle", max: 100 },
        { kind: "text", key: "phone", max: 40, inputType: "tel" },
        { kind: "text", key: "email", max: 320, inputType: "email" },
        { kind: "image", key: "image_asset_id", label: "portrait" },
      ],
    },
  ],
  lead_form: [
    eyebrow,
    heading,
    { kind: "textarea", key: "intro", max: 1000, rows: 3 },
    { kind: "text", key: "button_label", max: 60, placeholder: "buttonLabel" },
    { kind: "boolean", key: "show_unit_select" },
  ],
  documents: [eyebrow, heading, { kind: "assets", key: "asset_ids", label: "documents", assetKind: "document", max: 40, help: "documents" }],
  video: [
    eyebrow,
    heading,
    { kind: "text", key: "url", label: "videoUrl", max: 2048, inputType: "url", help: "video", placeholder: "videoUrl" },
    { kind: "text", key: "caption", max: 300 },
  ],
  faq: [
    eyebrow,
    heading,
    {
      kind: "list",
      key: "items",
      label: "questions",
      max: 40,
      titleKeys: ["question"],
      addLabel: "addQuestion",
      newItem: () => ({ question: "", answer: "" }),
      fields: [
        { kind: "text", key: "question", max: 300 },
        { kind: "textarea", key: "answer", max: 3000, rows: 4 },
      ],
    },
  ],
  news: [
    eyebrow,
    heading,
    {
      kind: "list",
      key: "items",
      label: "newsItems",
      max: 30,
      titleKeys: ["title", "date"],
      addLabel: "addNews",
      help: "news",
      newItem: () => ({ id: newBlockId(), date: new Date().toISOString().slice(0, 10), title: "", body: "", image_asset_id: null }),
      fields: [
        { kind: "date", key: "date", optional: true },
        { kind: "text", key: "title", label: "newsTitle", max: 200 },
        { kind: "richtext", key: "body", max: 5000 },
        { kind: "image", key: "image_asset_id" },
      ],
    },
  ],
  button: [
    { kind: "text", key: "label", label: "buttonText", max: 80 },
    { kind: "link", key: "link" },
    { kind: "select", key: "style", options: "buttonStyle", values: ["primary", "secondary"] },
    { kind: "select", key: "align", options: "align", values: ["left", "center", "right"] },
  ],
  embed: [
    eyebrow,
    heading,
    { kind: "text", key: "url", label: "embedUrl", max: 2048, inputType: "url", help: "embed", placeholder: "embedUrl" },
    { kind: "text", key: "title", label: "embedTitle", max: 200, help: "embedTitle" },
    { kind: "range", key: "height", label: "embedHeight", min: 200, max: 1200, step: 50, unit: "px" },
  ],
};

/** Navnet på et listeelement i editoren: første utfylte felt av titleKeys. */
export function listItemTitle(item: Values, titleKeys: string[]): string | null {
  const parts = titleKeys.map((key) => item[key]).filter((value): value is string => typeof value === "string" && value.trim() !== "");
  return parts[0] ?? null;
}

/** Valideringsfeil fra zod som { "items.2.start": "timeInvalid" }. */
export function issuesByPath(issues: readonly { path: readonly PropertyKey[]; message: string }[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    result[key] ??= issue.message;
  }
  return result;
}

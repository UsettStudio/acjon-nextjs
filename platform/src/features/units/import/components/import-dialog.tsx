"use client";

import { CircleAlertIcon, CircleCheckIcon, FileSpreadsheetIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useMemo, useRef, useState, useTransition } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { importUnits, type ImportSummary } from "@/features/units/import/actions";
import { isUnitStatus, numberFormatOf, type OwnershipType, type UnitType } from "@/features/units/fields";
import { IMPORT_FIELDS, suggestMapping, type ImportField } from "@/features/units/import/columns";
import { readSpreadsheet, SpreadsheetError, type Spreadsheet } from "@/features/units/import/spreadsheet";
import { MAX_IMPORT_ROWS, validateImport, type Cell } from "@/features/units/import/validate";
import type { ValidationKey } from "@/lib/actions/result";
import type { CommonActionError } from "@/lib/actions/result";
import { formatArea, formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type Step = "file" | "map" | "preview" | "done";
const SKIP = "__skip__";
const PREVIEW_ROWS = 200;

const cellText = (cell: Cell) =>
  cell === null || cell === undefined ? "" : cell instanceof Date ? cell.toISOString().slice(0, 10) : String(cell);

/**
 * Import fra CSV eller Excel: velg fil, koble kolonner, se forhåndsvisning med
 * feil per rad, og importer. Enheter med samme enhetsnummer oppdateres.
 */
export function ImportUnitsButton({
  organizationId,
  projectId,
  existingUnitNumbers,
}: {
  organizationId: string;
  projectId: string;
  existingUnitNumbers: string[];
}) {
  const t = useTranslations("units.import");
  const tFields = useTranslations("units.fields");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const tStatus = useTranslations("units.status.values");
  const tTypes = useTranslations("units.types");
  const tOwnership = useTranslations("units.ownership");
  const router = useRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("file");
  const [fileName, setFileName] = useState("");
  const [sheet, setSheet] = useState<Spreadsheet | null>(null);
  const [mapping, setMapping] = useState<(ImportField | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(false);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [pending, startTransition] = useTransition();

  const existing = useMemo(
    () => new Set(existingUnitNumbers.map((unitNumber) => unitNumber.toLocaleLowerCase("nb"))),
    [existingUnitNumbers],
  );
  const validation = useMemo(
    () => (sheet && step !== "file" ? validateImport(sheet.rows, mapping) : null),
    [sheet, mapping, step],
  );
  const mappedUnitNumber = mapping.includes("unit_number");

  function reset() {
    setStep("file");
    setFileName("");
    setSheet(null);
    setMapping([]);
    setError(null);
    setSkipInvalid(false);
    setOnlyErrors(false);
    setSummary(null);
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      if (summary) {
        router.refresh();
      }
      reset();
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) {
      return;
    }
    setError(null);
    setReading(true);
    try {
      const result = await readSpreadsheet(file);
      setFileName(file.name);
      setSheet(result);
      setMapping(suggestMapping(result.headers));
      setStep("map");
    } catch (caught) {
      const code = caught instanceof SpreadsheetError ? caught.code : "unreadable";
      setError(t(`fileErrors.${code}`, { max: MAX_IMPORT_ROWS }));
    } finally {
      setReading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function setColumn(index: number, value: string) {
    setMapping((previous) =>
      previous.map((field, column) => {
        if (column === index) {
          return value === SKIP ? null : (value as ImportField);
        }
        // Et felt kan bare kobles til én kolonne.
        return field === value ? null : field;
      }),
    );
  }

  function runImport() {
    if (!validation) {
      return;
    }
    const rows = skipInvalid ? validation.validRows : validation.rows;
    if (rows.length === 0 || (!skipInvalid && validation.errorCount > 0)) {
      return;
    }
    const columns = mapping.filter((field): field is ImportField => field !== null);
    setError(null);
    startTransition(async () => {
      const result = await importUnits(organizationId, projectId, {
        columns,
        rows: rows.map((row) => ({ line: row.line, values: row.values })),
      });
      if (result.ok) {
        setSummary(result.data);
        setStep("done");
        return;
      }
      const rowError = Object.entries(result.fieldErrors ?? {}).find(([key]) => key.startsWith("row."));
      if (rowError) {
        const [key, message] = rowError;
        setError(t("rowError", { line: key.slice(4), message: tValidation(message as ValidationKey) }));
      } else {
        setError(tErrors(result.error === "rowFailed" ? "unknown" : (result.error as CommonActionError)));
      }
    });
  }

  /** Verdien slik den blir lagret, vist på norsk: «3 285 000 kr», «55,5 m²», «Ledig». */
  function displayValue(field: ImportField, value: unknown): string {
    if (typeof value === "boolean") {
      return value ? tCommon("yes") : tCommon("no");
    }
    if (typeof value === "number" && field !== "stage" && field !== "building") {
      const format = numberFormatOf(field);
      return format === "currency"
        ? formatCurrency(value)
        : format === "area"
          ? formatArea(value)
          : formatNumber(value);
    }
    if (field === "status" && isUnitStatus(value)) {
      return tStatus(value);
    }
    if (field === "unit_type" && typeof value === "string") {
      return tTypes(value as UnitType);
    }
    if (field === "ownership_type" && typeof value === "string") {
      return tOwnership(value as OwnershipType);
    }
    return String(value);
  }

  const rowsToShow = validation
    ? (onlyErrors ? validation.rows.filter((row) => row.errors.length > 0) : validation.rows).slice(0, PREVIEW_ROWS)
    : [];
  const newCount =
    validation?.validRows.filter((row) => row.unitNumber && !existing.has(row.unitNumber.toLocaleLowerCase("nb")))
      .length ?? 0;
  const updateCount = (validation?.validRows.length ?? 0) - newCount;
  const mappedColumns = mapping.filter((field): field is ImportField => field !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadIcon aria-hidden="true" />
          {t("open")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tCommon("close")} className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t(`steps.${step}`)}</DialogDescription>
        </DialogHeader>
        <FormAlert message={error} />

        {step === "file" ? (
          <div className="grid gap-4">
            <label
              htmlFor={`${id}-file`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void onFile(event.dataTransfer.files[0]);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors hover:bg-accent/50",
                dragging && "border-primary bg-accent",
              )}
            >
              <FileSpreadsheetIcon aria-hidden="true" className="size-8 text-muted-foreground" />
              <span className="font-medium">{reading ? tCommon("loading") : t("chooseFile")}</span>
              <span className="text-sm text-muted-foreground">{t("fileHelp", { max: MAX_IMPORT_ROWS })}</span>
            </label>
            <input
              ref={inputRef}
              id={`${id}-file`}
              type="file"
              accept=".csv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              disabled={reading}
              onChange={(event) => void onFile(event.target.files?.[0])}
            />
            <p className="text-sm text-muted-foreground">{t("updateHelp")}</p>
          </div>
        ) : null}

        {step === "map" && sheet ? (
          <div className="grid gap-4">
            <p className="text-sm">{t("mapIntro", { file: fileName, rows: sheet.rows.length })}</p>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th scope="col" className="px-3 py-2 font-medium">
                      {t("fileColumn")}
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      {t("example")}
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      {t("importAs")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.headers.map((header, index) => {
                    const examples = sheet.rows
                      .slice(0, 3)
                      .map((row) => cellText(row[index]))
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <tr key={index} className="border-b last:border-0">
                        <th scope="row" className="px-3 py-2 text-left font-medium">
                          {header || t("noHeader", { number: index + 1 })}
                        </th>
                        <td className="max-w-56 truncate px-3 py-2 text-muted-foreground">{examples}</td>
                        <td className="px-3 py-2">
                          <Select value={mapping[index] ?? SKIP} onValueChange={(value) => setColumn(index, value)}>
                            <SelectTrigger
                              size="sm"
                              className="w-56"
                              aria-label={t("importAsFor", { column: header || t("noHeader", { number: index + 1 }) })}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={SKIP}>{t("skip")}</SelectItem>
                              {IMPORT_FIELDS.map((field) => (
                                <SelectItem key={field} value={field}>
                                  {tFields(field)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!mappedUnitNumber ? (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <CircleAlertIcon aria-hidden="true" className="size-4" />
                {t("unitNumberRequired")}
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">{t("emptyCellsHelp")}</p>
          </div>
        ) : null}

        {step === "preview" && validation ? (
          <div className="grid gap-4">
            <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm" aria-live="polite">
              <li>{t("countNew", { count: newCount })}</li>
              <li>{t("countUpdate", { count: updateCount })}</li>
              <li className={validation.errorCount > 0 ? "font-medium text-destructive" : undefined}>
                {t("countErrors", { count: validation.errorCount })}
              </li>
            </ul>
            {validation.errorCount > 0 ? (
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${id}-only-errors`}
                    checked={onlyErrors}
                    onCheckedChange={(checked) => setOnlyErrors(checked === true)}
                  />
                  <Label htmlFor={`${id}-only-errors`} className="font-normal">
                    {t("onlyErrors")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${id}-skip`}
                    checked={skipInvalid}
                    onCheckedChange={(checked) => setSkipInvalid(checked === true)}
                  />
                  <Label htmlFor={`${id}-skip`} className="font-normal">
                    {t("skipInvalid", { count: validation.errorCount })}
                  </Label>
                </div>
              </div>
            ) : null}
            <div className="max-h-[50svh] overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <caption className="sr-only">{t("previewCaption")}</caption>
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b text-left">
                    <th scope="col" className="px-3 py-2 font-medium">
                      {t("line")}
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      {t("result")}
                    </th>
                    {mappedColumns.map((field) => (
                      <th key={field} scope="col" className="px-3 py-2 font-medium whitespace-nowrap">
                        {tFields(field)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsToShow.map((row) => {
                    const invalid = row.errors.length > 0;
                    const isNew = row.unitNumber ? !existing.has(row.unitNumber.toLocaleLowerCase("nb")) : false;
                    return (
                      <tr key={row.line} className={cn("border-b last:border-0", invalid && "bg-destructive/5")}>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{row.line}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {invalid ? (
                            <span className="flex items-start gap-1.5 text-destructive">
                              <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                              <span>
                                {row.errors
                                  .map((rowError) =>
                                    rowError.field === "row"
                                      ? tValidation(rowError.message)
                                      : `${tFields(rowError.field)}: ${tValidation(rowError.message)}`,
                                  )
                                  .join(". ")}
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <CircleCheckIcon aria-hidden="true" className="size-4 text-emerald-600" />
                              {isNew ? t("willCreate") : t("willUpdate")}
                            </span>
                          )}
                        </td>
                        {mappedColumns.map((field) => {
                          const value = row.values[field];
                          return (
                            <td
                              key={field}
                              className={cn(
                                "max-w-48 truncate px-3 py-2",
                                typeof value === "number" && "text-right tabular-nums",
                              )}
                            >
                              {value === null || value === undefined ? (
                                <span className="text-muted-foreground">–</span>
                              ) : (
                                displayValue(field, value)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {validation.rows.length > PREVIEW_ROWS ? (
              <p className="text-sm text-muted-foreground">
                {t("previewLimited", { shown: PREVIEW_ROWS, total: validation.rows.length })}
              </p>
            ) : null}
          </div>
        ) : null}

        {step === "done" && summary ? (
          <div className="grid gap-3" aria-live="polite">
            <p className="flex items-center gap-2 font-medium">
              <CircleCheckIcon aria-hidden="true" className="size-5 text-emerald-600" />
              {t("doneTitle")}
            </p>
            <ul className="grid gap-1 text-sm">
              <li>{t("summaryInserted", { count: summary.inserted })}</li>
              <li>{t("summaryUpdated", { count: summary.updated })}</li>
              <li>{t("summaryUnchanged", { count: summary.unchanged })}</li>
              {summary.statusChanged > 0 ? <li>{t("summaryStatus", { count: summary.statusChanged })}</li> : null}
              {summary.stagesCreated + summary.buildingsCreated > 0 ? (
                <li>{t("summaryStructure", { stages: summary.stagesCreated, buildings: summary.buildingsCreated })}</li>
              ) : null}
            </ul>
          </div>
        ) : null}

        <DialogFooter>
          {step === "map" ? (
            <>
              <Button variant="outline" onClick={reset}>
                {t("chooseOther")}
              </Button>
              <Button disabled={!mappedUnitNumber} onClick={() => setStep("preview")}>
                {t("toPreview")}
              </Button>
            </>
          ) : null}
          {step === "preview" && validation ? (
            <>
              <Button variant="outline" onClick={() => setStep("map")}>
                {t("backToMapping")}
              </Button>
              <SubmitButton
                type="button"
                pending={pending}
                disabled={(validation.errorCount > 0 && !skipInvalid) || validation.validRows.length === 0}
                onClick={runImport}
              >
                {t("submit", { count: skipInvalid ? validation.validRows.length : validation.rows.length })}
              </SubmitButton>
            </>
          ) : null}
          {step === "done" ? <Button onClick={() => onOpenChange(false)}>{t("close")}</Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

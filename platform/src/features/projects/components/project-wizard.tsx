"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Controller, get, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/features/projects/actions";
import { ContactsEditor } from "@/features/projects/components/contacts-editor";
import { LocationFields } from "@/features/projects/components/location-fields";
import { MilestonesEditor } from "@/features/projects/components/milestones-editor";
import { PhaseSelect } from "@/features/projects/components/phase-select";
import { StructureEditor } from "@/features/projects/components/structure-editor";
import type { MemberOption } from "@/features/projects/queries";
import {
  createProjectSchema,
  DEFAULT_MILESTONES,
  type CreateProjectInput,
  type CreateProjectOutput,
} from "@/features/projects/schemas";
import { cn } from "@/lib/utils";

const STEPS = ["details", "location", "progress", "structure"] as const;
type Step = (typeof STEPS)[number];

/** Feltene som valideres før brukeren går videre fra et steg. */
const STEP_FIELDS: Record<Step, ("details" | "location" | "milestones" | "contacts" | "structure")[]> = {
  details: ["details"],
  location: ["location"],
  progress: ["milestones", "contacts"],
  structure: ["structure"],
};

function defaultValues(): CreateProjectInput {
  return {
    details: { name: "", phase: "draft", description: "" },
    location: { address: "", postal_code: "", city: "", municipality: "", lat: null, lng: null },
    milestones: DEFAULT_MILESTONES.map((milestone) => ({ ...milestone })),
    contacts: [],
    structure: { stages: [], buildings: [] },
  };
}

function stepOfError(errors: FieldErrors<CreateProjectInput>): Step | null {
  return STEPS.find((step) => STEP_FIELDS[step].some((field) => errors[field] !== undefined)) ?? null;
}

export function ProjectWizard({
  organizationId,
  organizationSlug,
  members,
}: {
  organizationId: string;
  organizationSlug: string;
  members: MemberOption[];
}) {
  const t = useTranslations("projects.wizard");
  const validation = useValidationMessage();
  const router = useRouter();
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<Step>("details");
  const [pending, startTransition] = useTransition();
  const stepIndex = STEPS.indexOf(step);
  const isLast = stepIndex === STEPS.length - 1;

  const form = useForm<CreateProjectInput, unknown, CreateProjectOutput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: defaultValues(),
  });
  const { formError, setFormError, apply } = useActionErrors(form);
  const { errors } = form.formState;
  const errorAt = (path: string) => validation((get(errors, path) as { message?: string } | undefined)?.message);

  // Flytt fokus til stegets overskrift, så skjermlesere får med seg at innholdet er byttet.
  const [focusStep, setFocusStep] = useState(false);
  useEffect(() => {
    if (focusStep) {
      headingRef.current?.focus();
    }
  }, [step, focusStep]);

  function goTo(next: Step) {
    setStep(next);
    setFocusStep(true);
  }

  async function next() {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (valid) {
      goTo(STEPS[stepIndex + 1] ?? step);
    }
  }

  const onSubmit = form.handleSubmit(
    () => {
      setFormError(null);
      const raw = form.getValues();
      startTransition(async () => {
        const result = await createProject(organizationId, raw);
        if (result.ok) {
          toast.success(t("created"));
          // Siden beholdes skjult etter navigering (React Activity). Nullstill, så neste prosjekt starter tomt.
          form.reset(defaultValues());
          setStep("details");
          setFocusStep(false);
          router.push(`/${organizationSlug}/projects/${result.data.slug}/units`);
        } else {
          apply(result);
          const failedFields = Object.keys(result.fieldErrors ?? {});
          const errorStep = STEPS.find((candidate) =>
            STEP_FIELDS[candidate].some((field) => failedFields.some((key) => key.startsWith(`${field}.`))),
          );
          if (errorStep) {
            goTo(errorStep);
          }
        }
      });
    },
    (invalid) => {
      const errorStep = stepOfError(invalid);
      if (errorStep) {
        goTo(errorStep);
      }
    },
  );

  return (
    <div className="grid gap-6">
      <nav aria-label={t("stepsLabel")}>
        <ol className="flex flex-wrap gap-2">
          {STEPS.map((item, index) => {
            const done = index < stepIndex;
            const current = item === step;
            return (
              <li key={item}>
                <button
                  type="button"
                  disabled={index > stepIndex}
                  aria-current={current ? "step" : undefined}
                  onClick={() => goTo(item)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-default",
                    current && "border-primary bg-primary text-primary-foreground",
                    done && "hover:bg-accent",
                    !current && !done && "text-muted-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-xs",
                      current ? "bg-primary-foreground/20" : "bg-muted",
                    )}
                  >
                    {done ? <CheckIcon className="size-3" /> : index + 1}
                  </span>
                  {t(`steps.${item}`)}
                  <span className="sr-only">{done ? t("stepDone") : null}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <form
        onSubmit={(event) => {
          // Enter i et felt sender skjemaet. Før siste steg betyr det «Neste», ikke «Opprett».
          const submitter = (event.nativeEvent as SubmitEvent).submitter;
          if (!isLast && submitter?.dataset.action !== "create") {
            event.preventDefault();
            void next();
            return;
          }
          void onSubmit(event);
        }}
        noValidate
        className="grid gap-6 rounded-lg border bg-card p-4 sm:p-6"
        aria-labelledby={`${id}-heading`}
      >
        <div className="grid gap-1">
          <h2 id={`${id}-heading`} ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
            {t(`headings.${step}`)}
          </h2>
          <p className="text-sm text-muted-foreground">{t(`intros.${step}`)}</p>
        </div>
        <FormAlert message={formError} />

        {step === "details" ? (
          <div className="grid max-w-xl gap-5">
            <Field name="project-name" label={t("name")} error={errorAt("details.name")}>
              {(field) => <Input {...field} autoComplete="off" {...form.register("details.name")} />}
            </Field>
            <Controller
              control={form.control}
              name="details.phase"
              render={({ field }) => (
                <PhaseSelect name="project-phase" value={field.value} onChange={field.onChange} error={errorAt("details.phase")} />
              )}
            />
            <Field name="project-description" label={t("description")} description={t("descriptionHelp")} error={errorAt("details.description")}>
              {(field) => <Textarea {...field} rows={4} {...form.register("details.description")} />}
            </Field>
          </div>
        ) : null}

        {step === "location" ? (
          <Controller
            control={form.control}
            name="location"
            render={({ field }) => (
              <LocationFields
                value={field.value}
                onChange={field.onChange}
                errors={{
                  address: errorAt("location.address"),
                  postal_code: errorAt("location.postal_code"),
                  city: errorAt("location.city"),
                  municipality: errorAt("location.municipality"),
                  lat: errorAt("location.lat"),
                  lng: errorAt("location.lng"),
                }}
              />
            )}
          />
        ) : null}

        {step === "progress" ? (
          <div className="grid gap-8">
            <section className="grid gap-3" aria-labelledby={`${id}-milestones`}>
              <h3 id={`${id}-milestones`} className="font-medium">
                {t("milestones")}
              </h3>
              <Controller
                control={form.control}
                name="milestones"
                render={({ field }) => (
                  <MilestonesEditor
                    value={field.value}
                    onChange={field.onChange}
                    errorFor={(index, key) => errorAt(`milestones.${index}.${key}`)}
                  />
                )}
              />
            </section>
            <section className="grid gap-3" aria-labelledby={`${id}-contacts`}>
              <h3 id={`${id}-contacts`} className="font-medium">
                {t("contacts")}
              </h3>
              <p className="text-sm text-muted-foreground">{t("contactsHelp")}</p>
              <Controller
                control={form.control}
                name="contacts"
                render={({ field }) => (
                  <ContactsEditor
                    value={field.value}
                    onChange={field.onChange}
                    members={members}
                    errorFor={(index, key) => errorAt(`contacts.${index}.${key}`)}
                  />
                )}
              />
            </section>
          </div>
        ) : null}

        {step === "structure" ? (
          <Controller
            control={form.control}
            name="structure"
            render={({ field }) => (
              <StructureEditor value={field.value} onChange={field.onChange} errorFor={(path) => errorAt(`structure.${path}`)} />
            )}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <Button type="button" variant="outline" disabled={stepIndex === 0} onClick={() => goTo(STEPS[stepIndex - 1] ?? step)}>
            {t("back")}
          </Button>
          <div className="flex flex-wrap gap-2">
            {!isLast ? (
              <Button type="button" onClick={() => void next()}>
                {t("next")}
              </Button>
            ) : null}
            {stepIndex > 0 ? (
              <SubmitButton pending={pending} variant={isLast ? "default" : "outline"} data-action="create">
                {t("create")}
              </SubmitButton>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Controller, get, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateProjectContacts,
  updateProjectDetails,
  updateProjectLocation,
  updateProjectMilestones,
} from "@/features/projects/actions";
import { ContactsEditor } from "@/features/projects/components/contacts-editor";
import { LocationFields } from "@/features/projects/components/location-fields";
import { MilestonesEditor } from "@/features/projects/components/milestones-editor";
import { PhaseSelect } from "@/features/projects/components/phase-select";
import type { MemberOption, ProjectDetail } from "@/features/projects/queries";
import {
  contactsSchema,
  locationSchema,
  milestonesSchema,
  updateProjectDetailsSchema,
  type ContactInput,
  type LocationInput,
  type MilestoneInput,
} from "@/features/projects/schemas";

type Props = { organizationId: string; project: ProjectDetail; disabled: boolean };

export function ProjectDetailsForm({ organizationId, project, disabled }: Props) {
  const t = useTranslations("projects.settings");
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const form = useForm<z.input<typeof updateProjectDetailsSchema>, unknown, z.output<typeof updateProjectDetailsSchema>>({
    resolver: zodResolver(updateProjectDetailsSchema),
    defaultValues: {
      name: project.name,
      slug: project.slug,
      phase: project.phase,
      description: project.description ?? "",
    },
  });
  const { formError, setFormError, apply } = useActionErrors(form);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(() => {
    setFormError(null);
    const raw = form.getValues();
    startTransition(async () => {
      const result = await updateProjectDetails(organizationId, project.id, raw);
      if (!result) {
        return;
      }
      if (result.ok) {
        toast.success(tCommon("saved"));
      } else {
        apply(result);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-5">
      <FormAlert message={formError} />
      <fieldset disabled={disabled} className="grid gap-5">
        <Field name="project-name" label={t("name")} error={validation(errors.name?.message)}>
          {(field) => <Input {...field} {...form.register("name")} />}
        </Field>
        <Field name="project-slug" label={t("slug")} description={t("slugHelp")} error={validation(errors.slug?.message)}>
          {(field) => <Input {...field} autoCapitalize="none" spellCheck={false} {...form.register("slug")} />}
        </Field>
        <Controller
          control={form.control}
          name="phase"
          render={({ field }) => (
            <PhaseSelect name="project-phase" value={field.value} onChange={field.onChange} error={validation(errors.phase?.message)} />
          )}
        />
        <Field name="project-description" label={t("description")} error={validation(errors.description?.message)}>
          {(field) => <Textarea {...field} rows={5} {...form.register("description")} />}
        </Field>
        <div>
          <SubmitButton pending={pending}>{tCommon("save")}</SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}

export function ProjectLocationForm({ organizationId, project, disabled }: Props) {
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const form = useForm<{ location: LocationInput }, unknown, { location: z.output<typeof locationSchema> }>({
    resolver: zodResolver(z.object({ location: locationSchema })),
    defaultValues: {
      location: {
        address: project.address ?? "",
        postal_code: project.postalCode ?? "",
        city: project.city ?? "",
        municipality: project.municipality ?? "",
        lat: project.lat,
        lng: project.lng,
      },
    },
  });
  const { formError, setFormError, apply } = useActionErrors(form);
  const errorAt = (path: string) => validation((get(form.formState.errors, path) as { message?: string } | undefined)?.message);

  const onSubmit = form.handleSubmit(() => {
    setFormError(null);
    const raw = form.getValues("location");
    startTransition(async () => {
      const result = await updateProjectLocation(organizationId, project.id, raw);
      if (result.ok) {
        toast.success(tCommon("saved"));
      } else {
        apply({ ...result, fieldErrors: prefix("location", result.fieldErrors) });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={formError} />
      <fieldset disabled={disabled} className="grid gap-5">
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
        <div>
          <SubmitButton pending={pending}>{tCommon("save")}</SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}

function prefix<T extends string>(path: string, errors: Record<string, T> | undefined): Record<string, T> | undefined {
  if (!errors) {
    return undefined;
  }
  return Object.fromEntries(Object.entries(errors).map(([key, value]) => [`${path}.${key}`, value]));
}

export function ProjectMilestonesForm({ organizationId, project, disabled }: Props) {
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const form = useForm<{ milestones: MilestoneInput[] }, unknown, { milestones: z.output<typeof milestonesSchema> }>({
    resolver: zodResolver(z.object({ milestones: milestonesSchema })),
    defaultValues: {
      milestones: project.milestones.map((milestone) => ({
        key: milestone.key,
        label: milestone.label ?? "",
        text: milestone.text ?? "",
        date: milestone.date ?? "",
      })),
    },
  });
  const { formError, setFormError, apply } = useActionErrors(form);

  const onSubmit = form.handleSubmit(() => {
    setFormError(null);
    const raw = form.getValues("milestones");
    startTransition(async () => {
      const result = await updateProjectMilestones(organizationId, project.id, raw);
      if (result.ok) {
        toast.success(tCommon("saved"));
      } else {
        apply({ ...result, fieldErrors: prefix("milestones", result.fieldErrors) });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={formError} />
      <fieldset disabled={disabled} className="grid gap-5">
        <Controller
          control={form.control}
          name="milestones"
          render={({ field }) => (
            <MilestonesEditor
              value={field.value}
              onChange={field.onChange}
              errorFor={(index, key) =>
                validation((get(form.formState.errors, `milestones.${index}.${key}`) as { message?: string } | undefined)?.message)
              }
            />
          )}
        />
        <div>
          <SubmitButton pending={pending}>{tCommon("save")}</SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}

export function ProjectContactsForm({ organizationId, project, disabled, members }: Props & { members: MemberOption[] }) {
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const form = useForm<{ contacts: ContactInput[] }, unknown, { contacts: z.output<typeof contactsSchema> }>({
    resolver: zodResolver(z.object({ contacts: contactsSchema })),
    defaultValues: {
      contacts: project.contacts.map((contact) => ({
        name: contact.name,
        title: contact.title ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        user_id: contact.user_id ?? "",
        receives_leads: contact.receives_leads,
      })),
    },
  });
  const { formError, setFormError, apply } = useActionErrors(form);

  const onSubmit = form.handleSubmit(() => {
    setFormError(null);
    const raw = form.getValues("contacts");
    startTransition(async () => {
      const result = await updateProjectContacts(organizationId, project.id, raw);
      if (result.ok) {
        toast.success(tCommon("saved"));
      } else {
        apply({ ...result, fieldErrors: prefix("contacts", result.fieldErrors) });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={formError} />
      <fieldset disabled={disabled} className="grid gap-5">
        <Controller
          control={form.control}
          name="contacts"
          render={({ field }) => (
            <ContactsEditor
              value={field.value}
              onChange={field.onChange}
              members={members}
              errorFor={(index, key) =>
                validation((get(form.formState.errors, `contacts.${index}.${key}`) as { message?: string } | undefined)?.message)
              }
            />
          )}
        />
        <div>
          <SubmitButton pending={pending}>{tCommon("save")}</SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}

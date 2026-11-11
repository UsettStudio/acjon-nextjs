"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteMember } from "@/features/members/actions";
import { InvitationLink } from "@/features/members/components/invitation-link";
import { ProjectChecklist } from "@/features/members/components/project-checklist";
import type { ProjectOption } from "@/features/members/queries";
import { inviteMemberSchema, type InviteMemberInput } from "@/features/members/schemas";
import { isProjectScopedRole, type MemberRole } from "@/lib/auth/permissions";

type Sent = { email: string; link: string; delivered: boolean };

export function InviteMemberDialog({
  organizationId,
  roles,
  projects,
  disabled,
}: {
  organizationId: string;
  roles: MemberRole[];
  projects: ProjectOption[];
  disabled: boolean;
}) {
  const t = useTranslations("members.invite");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const tRoleDescriptions = useTranslations("roleDescriptions");
  const validation = useValidationMessage();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [pending, startTransition] = useTransition();

  const defaultRole: MemberRole = roles.includes("editor") ? "editor" : (roles[0] ?? "editor");
  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: defaultRole, projectIds: [] },
  });
  const translateSpecific = useCallback(
    (code: string) => {
      const email = form.getValues("email");
      if (code === "alreadyMember") return t("alreadyMember", { email });
      if (code === "alreadyInvited") return t("alreadyInvited", { email });
      return undefined;
    },
    [form, t],
  );
  const { formError, setFormError, apply } = useActionErrors(form, translateSpecific);
  const role = useWatch({ control: form.control, name: "role" });
  const { errors } = form.formState;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset({ email: "", role: defaultRole, projectIds: [] });
      setFormError(null);
      setSent(null);
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await inviteMember(organizationId, values);
      if (result.ok) {
        setSent(result.data);
      } else {
        apply(result);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <UserPlusIcon aria-hidden="true" />
          {t("open")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tCommon("close")}>
        {sent ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("sentTitle")}</DialogTitle>
              <DialogDescription>
                {sent.delivered ? t("sent", { email: sent.email }) : t("emailFailed")}
              </DialogDescription>
            </DialogHeader>
            <InvitationLink link={sent.link} />
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>{t("done")}</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={onSubmit} noValidate className="grid gap-5">
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            <FormAlert message={formError} />
            <Field name="invite-email" label={t("email")} error={validation(errors.email?.message)}>
              {(field) => <Input {...field} type="email" autoComplete="off" {...form.register("email")} />}
            </Field>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Field
                  name="invite-role"
                  label={t("role")}
                  description={tRoleDescriptions(field.value)}
                  error={validation(errors.role?.message)}
                >
                  {(control) => (
                    <Select value={field.value} onValueChange={(value) => field.onChange(value as MemberRole)}>
                      <SelectTrigger {...control} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((option) => (
                          <SelectItem key={option} value={option}>
                            {tRoles(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              )}
            />
            {isProjectScopedRole(role) ? (
              <Controller
                control={form.control}
                name="projectIds"
                render={({ field }) => (
                  <fieldset className="grid gap-2">
                    <legend className="mb-2 text-sm font-medium">{t("projects")}</legend>
                    <p className="text-sm text-muted-foreground">{t("projectsHelp")}</p>
                    <ProjectChecklist
                      projects={projects}
                      selected={field.value}
                      onChange={field.onChange}
                    />
                  </fieldset>
                )}
              />
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon("cancel")}
              </Button>
              <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

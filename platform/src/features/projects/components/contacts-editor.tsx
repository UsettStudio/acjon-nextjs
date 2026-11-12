"use client";

import { PlusIcon, Trash2Icon, UserPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ListErrors } from "@/features/projects/components/milestones-editor";
import type { MemberOption } from "@/features/projects/queries";
import type { ContactInput } from "@/features/projects/schemas";

const emptyContact: ContactInput = { name: "", title: "", email: "", phone: "", user_id: "", receives_leads: true };

/** Kontaktpersoner for prosjektet. Kan hentes fra organisasjonens brukere. */
export function ContactsEditor({
  value,
  onChange,
  errorFor,
  members,
}: {
  value: ContactInput[];
  onChange: (value: ContactInput[]) => void;
  errorFor: ListErrors;
  members: MemberOption[];
}) {
  const t = useTranslations("projects.contacts");
  const baseId = useId();
  const update = (index: number, patch: Partial<ContactInput>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const available = members.filter((member) => !value.some((contact) => contact.user_id === member.userId));

  return (
    <div className="grid gap-4">
      {value.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
      <ul className="grid gap-4">
        {value.map((contact, index) => (
          <li key={index} className="grid gap-3 rounded-md border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name={`contact-${index}-name`} label={t("name")} error={errorFor(index, "name")}>
                {(field) => (
                  <Input {...field} autoComplete="off" value={contact.name} onChange={(event) => update(index, { name: event.target.value })} />
                )}
              </Field>
              <Field name={`contact-${index}-title`} label={t("title")} error={errorFor(index, "title")}>
                {(field) => (
                  <Input
                    {...field}
                    placeholder={t("titlePlaceholder")}
                    value={contact.title}
                    onChange={(event) => update(index, { title: event.target.value })}
                  />
                )}
              </Field>
              <Field name={`contact-${index}-email`} label={t("email")} error={errorFor(index, "email")}>
                {(field) => (
                  <Input
                    {...field}
                    type="email"
                    autoComplete="off"
                    value={contact.email}
                    onChange={(event) => update(index, { email: event.target.value })}
                  />
                )}
              </Field>
              <Field name={`contact-${index}-phone`} label={t("phone")} error={errorFor(index, "phone")}>
                {(field) => (
                  <Input
                    {...field}
                    type="tel"
                    autoComplete="off"
                    value={contact.phone}
                    onChange={(event) => update(index, { phone: event.target.value })}
                  />
                )}
              </Field>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${baseId}-${index}-leads`}
                  checked={contact.receives_leads}
                  onCheckedChange={(checked) => update(index, { receives_leads: checked === true })}
                />
                <Label htmlFor={`${baseId}-${index}-leads`} className="font-normal">
                  {t("receivesLeads")}
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={t("remove", { name: contact.name || t("unnamed") })}
              >
                <Trash2Icon aria-hidden="true" />
                {t("removeShort")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={value.length >= 20}
          onClick={() => onChange([...value, emptyContact])}
        >
          <PlusIcon aria-hidden="true" />
          {t("add")}
        </Button>
        {available.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={value.length >= 20}>
                <UserPlusIcon aria-hidden="true" />
                {t("addMember")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {available.map((member) => (
                <DropdownMenuItem
                  key={member.userId}
                  onSelect={() =>
                    onChange([
                      ...value,
                      {
                        name: member.name,
                        title: "",
                        email: member.email ?? "",
                        phone: member.phone ?? "",
                        user_id: member.userId,
                        receives_leads: true,
                      },
                    ])
                  }
                >
                  {member.name}
                  {member.email && member.email !== member.name ? (
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}

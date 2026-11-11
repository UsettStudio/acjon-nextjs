"use client";

import { EllipsisIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubmitButton } from "@/components/forms/submit-button";
import { changeMemberRole, leaveOrganization, removeMember, setProjectAccess } from "@/features/members/actions";
import { ProjectChecklist } from "@/features/members/components/project-checklist";
import type { MemberRow, ProjectOption } from "@/features/members/queries";
import type { CommonActionError } from "@/lib/actions/result";
import { canManageMember, isProjectScopedRole, type MemberRole } from "@/lib/auth/permissions";

type Confirm = { kind: "remove" | "leave"; member: MemberRow } | null;

export function MembersTable({
  organizationId,
  currentUserId,
  actorRole,
  assignable,
  members,
  projects,
  readOnly,
}: {
  organizationId: string;
  currentUserId: string;
  actorRole: MemberRole;
  assignable: MemberRole[];
  members: MemberRow[];
  projects: ProjectOption[];
  readOnly: boolean;
}) {
  const t = useTranslations("members");
  const tRoles = useTranslations("roles");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [accessFor, setAccessFor] = useState<MemberRow | null>(null);
  const [accessSelection, setAccessSelection] = useState<string[]>([]);

  const displayName = (member: MemberRow) => member.fullName || member.email || t("unnamed");

  function showError(error: string) {
    toast.error(error === "lastOwner" ? t("lastOwner") : tErrors(error as CommonActionError));
  }

  function onRoleChange(member: MemberRow, role: MemberRole) {
    startTransition(async () => {
      const result = await changeMemberRole(organizationId, member.membershipId, role);
      if (result.ok) {
        toast.success(t("roleChanged"));
      } else {
        showError(result.error);
      }
    });
  }

  function onConfirm() {
    if (!confirm) {
      return;
    }
    const { kind, member } = confirm;
    startTransition(async () => {
      const result =
        kind === "leave"
          ? await leaveOrganization(organizationId)
          : await removeMember(organizationId, member.membershipId);
      if (!result) {
        return;
      }
      if (result.ok) {
        toast.success(kind === "leave" ? t("left") : t("removed", { name: displayName(member) }));
        setConfirm(null);
      } else {
        showError(result.error);
        setConfirm(null);
      }
    });
  }

  function openAccess(member: MemberRow) {
    setAccessSelection(member.projectIds);
    setAccessFor(member);
  }

  function saveAccess() {
    if (!accessFor) {
      return;
    }
    const member = accessFor;
    startTransition(async () => {
      const result = await setProjectAccess(organizationId, member.userId, accessSelection);
      if (result.ok) {
        toast.success(t("accessSaved"));
        setAccessFor(null);
      } else {
        showError(result.error);
      }
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("role")}</TableHead>
            <TableHead>{t("projects")}</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">{t("actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;
            const manageable = !readOnly && !isSelf && canManageMember(actorRole, member.role);
            const name = displayName(member);
            return (
              <TableRow key={member.membershipId}>
                <TableCell>
                  <div className="font-medium">
                    {name}
                    {isSelf ? <span className="text-muted-foreground"> ({tCommon("you")})</span> : null}
                  </div>
                  {member.fullName && member.email ? (
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  {manageable ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) => onRoleChange(member, value as MemberRole)}
                      disabled={pending}
                    >
                      <SelectTrigger size="sm" aria-label={t("changeRoleLabel", { name })}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignable.map((role) => (
                          <SelectItem key={role} value={role}>
                            {tRoles(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary">{tRoles(member.role)}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {isProjectScopedRole(member.role)
                    ? t("projectCount", { count: member.projectIds.length })
                    : t("allProjects")}
                </TableCell>
                <TableCell>
                  {manageable || isSelf ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={t("memberActions", { name })}>
                          <EllipsisIcon aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {manageable && isProjectScopedRole(member.role) ? (
                          <DropdownMenuItem onSelect={() => openAccess(member)}>{t("editAccess")}</DropdownMenuItem>
                        ) : null}
                        {manageable ? (
                          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ kind: "remove", member })}>
                            {t("remove")}
                          </DropdownMenuItem>
                        ) : null}
                        {isSelf ? (
                          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ kind: "leave", member })}>
                            {t("leave")}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "leave" ? t("leaveTitle") : t("removeTitle", { name: confirm ? displayName(confirm.member) : "" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "leave" ? t("leaveBody") : t("removeBody", { name: confirm ? displayName(confirm.member) : "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                onConfirm();
              }}
            >
              {confirm?.kind === "leave" ? t("leave") : t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={accessFor !== null} onOpenChange={(open) => !open && setAccessFor(null)}>
        <DialogContent closeLabel={tCommon("close")}>
          <DialogHeader>
            <DialogTitle>{t("accessTitle", { name: accessFor ? displayName(accessFor) : "" })}</DialogTitle>
            <DialogDescription>{t("accessDescription")}</DialogDescription>
          </DialogHeader>
          <ProjectChecklist
            idPrefix="access-project"
            projects={projects}
            selected={accessSelection}
            onChange={setAccessSelection}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccessFor(null)}>
              {tCommon("cancel")}
            </Button>
            <SubmitButton type="button" pending={pending} onClick={saveAccess}>
              {tCommon("save")}
            </SubmitButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

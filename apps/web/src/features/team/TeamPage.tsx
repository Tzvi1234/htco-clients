import { Plural, Trans, useLingui } from "@lingui/react/macro";
import type { components } from "@htco/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useRef, useState, type RefObject, type SyntheticEvent } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

import { useAgents } from "../../shared/demo/office.ts";
import {
  ApiError,
  apiError,
  authKeys,
  meQuery,
  mfaQuery,
  shopsQuery,
  useApi,
  type ApiClient,
} from "../../shared/api/api.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { PHONE_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { CheckIcon, CloseIcon } from "../../shared/ui/icons.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Aside,
  Avatar,
  ChoiceChips,
  CircleButton,
  CopyGlyph,
  DataTable,
  DemoPart,
  DemoTag,
  Dot,
  Figure,
  Figures,
  Flow,
  FlowBody,
  FlowRow,
  Focus,
  IdBlock,
  KV,
  KV2,
  PillField,
  N,
  PlusGlyph,
  SectionLabel,
  Status,
  SubTabs,
  TabPanel,
  Toggle,
  WhatsappGlyph,
  Who,
  useStatusLabels,
} from "../../shared/ui/kit/index.ts";

type Role = components["schemas"]["Role"];
type Member = components["schemas"]["MemberView"];

const INVITABLE: Role[] = ["admin", "operations", "finance", "support", "developer", "viewer"];
/** Owners and Admins see every shop of the organization (the permission matrix). */
const ORGANIZATION_WIDE: readonly string[] = ["owner", "admin"];

const membersKey = (organizationId: string) => ["organizations", organizationId, "members"];

function membersQuery(api: ApiClient, organizationId: string) {
  return {
    queryKey: membersKey(organizationId),
    queryFn: async () => {
      const { data, error, response } = await api.GET(
        "/v1/organizations/{organization_id}/members",
        { params: { path: { organization_id: organizationId } } },
      );
      if (data === undefined) throw apiError(response, error);
      return data.items;
    },
  };
}

/**
 * Members & access (FR-IAM-02, FR-IAM-03): who works in the organization, their role and shops,
 * inviting someone new, changing a role, granting shops and removing a member. Owners and
 * Admins. The Design 1C screen (`P.members`): the members table and, beside it, inviting or the
 * chosen member, and the approval policy (a demo until policies are built).
 */
export function TeamPage() {
  const { t } = useLingui();
  const api = useApi();
  const me = useQuery(meQuery(api));
  const managed = (me.data?.memberships ?? [])
    .filter((m) => m.role === "owner" || m.role === "admin")
    .map((m) => m.organization_id);
  const [chosen, setChosen] = useState<string | null>(null);
  const organizationId = pickWorkspace(managed, chosen);
  // Only an Owner may grant the Owner role (the contract of change_member_role).
  const actingOwner =
    me.data?.memberships.some((m) => m.organization_id === organizationId && m.role === "owner") ??
    false;
  const [selected, setSelected] = useState<string | null>(null);
  const phone = useMediaQuery(PHONE_QUERY);
  const emailRef = useRef<HTMLInputElement>(null);

  const tabs = useId();
  const [tab, setTab] = useState<"people" | "employees" | "policy">("people");

  const startInvite = () => {
    setSelected(null);
    setTab("people");
    // After the invite panel is back in place.
    setTimeout(() => emailRef.current?.focus(), 0);
  };

  return (
    <>
      <PageHeader title={t`Members & access`} />
      <Flow>
        <TeamFocus organizationId={organizationId} onInvite={startInvite} />
        <SubTabs
          label={t`Members views`}
          idBase={tabs}
          value={tab}
          onChange={(next) => {
            setTab(next);
          }}
          tabs={[
            { id: "people", label: <Trans>People</Trans> },
            { id: "employees", label: <Trans>AI employees</Trans>, demo: <DemoTag /> },
            { id: "policy", label: <Trans>Policy</Trans>, demo: <DemoTag /> },
          ]}
        />
        <TabPanel idBase={tabs} tab={tab}>
          {tab === "employees" ? (
            <Panel>
              <EmployeesDemo />
            </Panel>
          ) : tab === "policy" ? (
            <PolicyPanel />
          ) : (
            <FlowRow layout="main-side">
              <Panel>
                <PanelHeader
                  title={<Trans>Members & access</Trans>}
                  meta={<MemberCount organizationId={organizationId} />}
                />
                {managed.length > 1 ? (
                  <div className="px-6 pb-3">
                    <ChoiceChips
                      label={t`Workspace`}
                      value={organizationId ?? null}
                      onChange={(id) => {
                        setChosen(id);
                        setSelected(null);
                      }}
                      options={managed.map((id) => ({ id, label: id.slice(0, 8), ltr: true }))}
                    />
                  </div>
                ) : null}
                {organizationId === undefined ? (
                  managed.length > 1 ? (
                    <FlowBody className="items-center py-10 text-center">
                      <p className="m-0 max-w-[320px] text-body-sm font-light text-muted">
                        <Trans>
                          Choose the workspace whose members you want to see and invite.
                        </Trans>
                      </p>
                    </FlowBody>
                  ) : null
                ) : (
                  <MembersTable
                    organizationId={organizationId}
                    selected={selected}
                    onSelect={setSelected}
                    myId={me.data?.user_id}
                  />
                )}
              </Panel>
              <Aside>
                {organizationId === undefined ? (
                  <Panel>
                    <PanelHeader title={<Trans>Invite member</Trans>} />
                  </Panel>
                ) : selected !== null && !phone ? (
                  <MemberPanel
                    key={selected}
                    organizationId={organizationId}
                    memberId={selected}
                    myId={me.data?.user_id}
                    actingOwner={actingOwner}
                    onClose={startInvite}
                  />
                ) : (
                  <InvitePanel
                    key={organizationId}
                    organizationId={organizationId}
                    emailRef={emailRef}
                  />
                )}
              </Aside>
            </FlowRow>
          )}
        </TabPanel>
      </Flow>
      {phone && organizationId !== undefined && selected !== null ? (
        <ModalOverlay
          isOpen
          isDismissable
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          className="fixed inset-0 z-50 flex items-end bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)]"
        >
          <Modal className="w-full animate-[htco-sheet-in_var(--motion-duration-slow)_var(--motion-easing-enter)_both] p-2 pb-[max(8px,env(safe-area-inset-bottom))]">
            <Dialog className="outline-none" aria-label={t`Member`}>
              <MemberPanel
                organizationId={organizationId}
                memberId={selected}
                myId={me.data?.user_id}
                actingOwner={actingOwner}
                onClose={() => {
                  setSelected(null);
                }}
                sheet
              />
            </Dialog>
          </Modal>
        </ModalOverlay>
      ) : null}
    </>
  );
}

/** The team at a glance: who is in, who is invited, and the one action (invite someone). */
function TeamFocus({
  organizationId,
  onInvite,
}: {
  organizationId: string | undefined;
  onInvite: () => void;
}) {
  const { t } = useLingui();
  const api = useApi();
  const members = useQuery({
    ...membersQuery(api, organizationId ?? ""),
    enabled: organizationId !== undefined,
  });
  const list = members.data ?? [];
  const invited = list.filter((m) => m.display_name === null).length;
  const leads = list.filter((m) => ORGANIZATION_WIDE.includes(m.role)).length;
  const known = members.data !== undefined;
  return (
    <Focus
      title={<Trans>Your team</Trans>}
      meta={<Trans>People who work in the workspace, and what they may reach</Trans>}
      lead={
        !known ? undefined : invited > 0 ? (
          <Plural
            value={invited}
            one="One invitation is not accepted yet. Send the link again if it expired."
            other="# invitations are not accepted yet. Send the link again if one expired."
          />
        ) : list.length <= 1 ? (
          <Trans>You work alone so far. Invite someone and choose what they may do.</Trans>
        ) : (
          <Trans>Everyone invited has joined.</Trans>
        )
      }
      figures={
        <Figures label={t`Team numbers`}>
          <Figure
            label={<Trans>Members</Trans>}
            value={<N>{known ? String(list.length) : "—"}</N>}
          />
          <Figure
            label={<Trans>Invited</Trans>}
            value={<N>{known ? String(invited) : "—"}</N>}
            tone={invited > 0 ? "tertiary" : undefined}
          />
          <Figure
            label={<Trans>Owners and Admins</Trans>}
            value={<N>{known ? String(leads) : "—"}</N>}
            note={<Trans>see every shop</Trans>}
          />
        </Figures>
      }
      actions={
        organizationId === undefined ? undefined : (
          <Button size="lg" onPress={onInvite}>
            <PlusGlyph size={14} />
            <Trans>Invite member</Trans>
          </Button>
        )
      }
    />
  );
}

/** The workspace in use: the only one, or the one the user picked. */
function pickWorkspace(ids: string[], chosen: string | null): string | undefined {
  if (ids.length === 1) return ids[0];
  return chosen !== null && ids.includes(chosen) ? chosen : undefined;
}

function MemberCount({ organizationId }: { organizationId: string | undefined }) {
  const api = useApi();
  const members = useQuery({
    ...membersQuery(api, organizationId ?? ""),
    enabled: organizationId !== undefined,
  });
  if (members.data === undefined) return null;
  return <span className="ltr">{members.data.length}</span>;
}

export function useRoleLabel() {
  const { t } = useLingui();
  return (role: string): string => {
    switch (role) {
      case "owner":
        return t`Owner`;
      case "admin":
        return t`Admin`;
      case "operations":
        return t`Operations`;
      case "finance":
        return t`Finance`;
      case "support":
        return t`Support`;
      case "developer":
        return t`Developer`;
      default:
        return t`Viewer`;
    }
  };
}

/** What a member can reach: every shop for Owners and Admins, else the shops granted. */
function useAccessLabel() {
  const { t } = useLingui();
  return (member: Member): string => {
    if (ORGANIZATION_WIDE.includes(member.role)) return t`All shops`;
    const count = member.shop_ids.length;
    if (count === 0) return t`No shops`;
    return count === 1 ? t`1 shop` : t`${count} shops`;
  };
}

function MembersTable({
  organizationId,
  selected,
  onSelect,
  myId,
}: {
  organizationId: string;
  selected: string | null;
  onSelect: (id: string) => void;
  myId: string | undefined;
}) {
  const { t } = useLingui();
  const api = useApi();
  const members = useQuery(membersQuery(api, organizationId));
  const roleLabel = useRoleLabel();
  const access = useAccessLabel();

  if (members.isError)
    return (
      <p role="alert" className="m-0 px-6 py-4 text-body-sm text-danger-text">
        <Trans>The members cannot be loaded right now. Try again shortly.</Trans>
      </p>
    );

  return (
    <DataTable
      label={t`Members`}
      flow
      phoneHidden={[1, 3, 4]}
      head={[t`Name`, t`Type`, t`Role`, t`Access`, t`Needs approval`, t`Status`]}
      rows={(members.data ?? []).map((member) => {
        const name = member.display_name ?? t`Invited member`;
        const you = member.user_id === myId;
        return {
          key: member.id,
          selected: member.id === selected,
          onSelect: () => {
            onSelect(member.id);
          },
          cells: [
            <span key="name" className="inline-flex items-center gap-2">
              <Who name={name} ink={member.role === "owner"} />
              {you ? <span className="text-caption font-light text-muted">{t`(you)`}</span> : null}
            </span>,
            t`Human`,
            roleLabel(member.role),
            access(member),
            <span key="approval" className="text-muted">
              —
            </span>,
            member.display_name === null ? (
              <Status key="status" live status="queued" label={t`Invited`} />
            ) : (
              <Status key="status" live status="running" label={t`Active`} />
            ),
          ],
        };
      })}
    />
  );
}

/** The AI employees as members: planned with the living office, shown as a demo. */
function EmployeesDemo() {
  const { t } = useLingui();
  const { list } = useAgents();
  const words = useStatusLabels();
  return (
    <section aria-label={t`AI employees`}>
      <PanelHeader
        title={<Trans>AI employees</Trans>}
        meta={<Trans>They join as members with the living office</Trans>}
        actions={<DemoTag className="me-4" />}
      />
      <DemoPart tag={false}>
        <DataTable
          label={t`AI employees`}
          flow
          phoneHidden={[1, 2, 3, 4]}
          head={[t`Name`, t`Type`, t`Role`, t`Access`, t`Needs approval`, t`Status`]}
          rows={list.slice(0, 9).map((employee) => ({
            key: employee.id,
            cells: [
              <Who key="name" name={employee.name} />,
              <span key="type" className="ltr">
                AI
              </span>,
              employee.role,
              employee.deptId === "exec" ? t`Read + act` : t`Read + draft`,
              employee.deptId === "exec" || employee.deptId === "proc"
                ? t`Money, refunds`
                : t`Publishing`,
              <Status key="state" live status={employee.status} label={words[employee.status]} />,
            ],
          }))}
        />
      </DemoPart>
    </section>
  );
}

/** What went wrong with an invitation, in words (the macro needs `t` from useLingui). */
function useInviteMessage() {
  const { t } = useLingui();
  return (error: Error | null): string | undefined => {
    if (error === null) return undefined;
    if (!(error instanceof ApiError)) return t`This did not work. Try again shortly.`;
    switch (error.status) {
      case 409:
        return t`This person is already a member.`;
      case 422:
        return t`Check the email address.`;
      case 403:
        return t`Confirm with your authenticator app, then try again.`;
      default:
        return t`Invitations cannot be sent right now. Try again shortly.`;
    }
  };
}

function InvitePanel({
  organizationId,
  emailRef,
}: {
  organizationId: string;
  emailRef: RefObject<HTMLInputElement | null>;
}) {
  const { t } = useLingui();
  const api = useApi();
  const queryClient = useQueryClient();
  const roleLabel = useRoleLabel();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [copied, setCopied] = useState(false);
  const inviteMessage = useInviteMessage();

  const invite = useMutation({
    mutationFn: async (invitee: string) => {
      const { data, error, response } = await api.POST(
        "/v1/organizations/{organization_id}/invitations",
        { params: { path: { organization_id: organizationId } }, body: { email: invitee, role } },
      );
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    onSuccess: async () => {
      setEmail("");
      setCopied(false);
      await queryClient.invalidateQueries({ queryKey: ["organizations", organizationId] });
    },
  });

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    invite.mutate(email);
  }

  const link = invite.data?.invite_link ?? null;
  const share = link === null ? null : t`You're invited to HT-Commerce: ${link}`;
  const message = inviteMessage(invite.error);
  const invitedRole = roleLabel(invite.data?.role ?? role);
  const invitedEmail = invite.variables ?? "";

  return (
    <Panel label={t`Invite member`}>
      <PanelHeader title={<Trans>Invite member</Trans>} />
      {link === null || share === null ? (
        <PanelBody className="gap-4">
          <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
            <PillField
              label={t`Email`}
              placeholder="name@company.com"
              type="email"
              ltr
              isRequired
              value={email}
              onChange={setEmail}
              inputRef={emailRef}
            />
            <ChoiceChips
              label={t`Role`}
              value={role}
              onChange={setRole}
              options={INVITABLE.map((id) => ({ id, label: roleLabel(id) }))}
            />
            {message === undefined ? null : (
              <p role="alert" className="m-0 animate-enter text-body-sm text-danger-text">
                {message}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" isPending={invite.isPending}>
              <Trans>Invite</Trans>
            </Button>
          </form>
        </PanelBody>
      ) : (
        <PanelBody className="animate-enter justify-between gap-4">
          <div className="flex flex-col items-center gap-2 pt-1">
            <span className="flex size-12 animate-pop-in items-center justify-center rounded-pill bg-inverse text-on-inverse">
              <CheckIcon size={18} />
            </span>
            <IdBlock
              label={t`Invitation ready · ${invitedRole}`}
              value={<span className="ltr text-title font-normal">{invitedEmail}</span>}
              className="max-w-full"
            />
          </div>
          <p className="m-0 text-center text-caption text-secondary">
            <Trans>
              Send this link to them yourself. It works once; when it expires, invite them again.
            </Trans>
          </p>
          <PillField
            label={t`Invitation link`}
            value={link}
            isReadOnly
            ltr
            mono
            className="[&_label]:sr-only"
          />
          <div className="grid grid-cols-1 gap-2">
            <Button
              size="lg"
              onPress={() => {
                void navigator.clipboard.writeText(link).then(() => {
                  setCopied(true);
                });
              }}
            >
              {copied ? <CheckIcon size={14} /> : <CopyGlyph size={14} />}
              {copied ? <Trans>Copied</Trans> : <Trans>Copy link</Trans>}
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(share)}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-button border border-line-strong px-4 text-body-sm whitespace-nowrap text-primary no-underline transition-colors hover:border-line-hover-strong hover:bg-hover"
            >
              <WhatsappGlyph size={14} />
              <Trans>Send on WhatsApp</Trans>
            </a>
          </div>
          <Button
            variant="ghost"
            onPress={() => {
              invite.reset();
              setTimeout(() => emailRef.current?.focus(), 0);
            }}
          >
            <PlusGlyph size={14} />
            <Trans>Invite someone else</Trans>
          </Button>
        </PanelBody>
      )}
    </Panel>
  );
}

/** Why a change to a member did not happen, in words. */
function useAccessMessage() {
  const { t } = useLingui();
  return (error: Error | null): string | undefined => {
    if (error === null) return undefined;
    if (error instanceof ApiError) {
      if (error.status === 403) return t`Confirm with your authenticator app, then try again.`;
      if (error.status === 404) return t`This member or shop is no longer in the workspace.`;
      if (error.status === 422) return t`The server did not accept this change.`;
    }
    return t`This did not work. Try again shortly.`;
  };
}

/** The chosen member: their role, their shops, and removing them. */
function MemberPanel({
  organizationId,
  memberId,
  myId,
  actingOwner,
  onClose,
  sheet = false,
}: {
  organizationId: string;
  memberId: string;
  myId: string | undefined;
  /** The signed-in user is this workspace's Owner, who alone may grant the Owner role. */
  actingOwner: boolean;
  onClose: () => void;
  sheet?: boolean;
}) {
  const { t } = useLingui();
  const api = useApi();
  const queryClient = useQueryClient();
  const roleLabel = useRoleLabel();
  const access = useAccessLabel();
  const members = useQuery(membersQuery(api, organizationId));
  const shops = useQuery(shopsQuery(api, organizationId));
  const [confirming, setConfirming] = useState(false);
  const accessMessage = useAccessMessage();
  const member = members.data?.find((m) => m.id === memberId);
  // Changing one's own membership changes what one may do: the identity is read again too.
  const self = member !== undefined && member.user_id === myId;
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: membersKey(organizationId) });
    if (self) await queryClient.invalidateQueries({ queryKey: authKeys.me });
  };
  const path = { organization_id: organizationId, membership_id: memberId };

  const changeRole = useMutation({
    mutationFn: async (role: Role) => {
      const { data, error, response } = await api.PATCH(
        "/v1/organizations/{organization_id}/members/{membership_id}",
        { params: { path }, body: { role } },
      );
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    onSuccess: refresh,
  });
  const grant = useMutation({
    mutationFn: async ({ shopId, on }: { shopId: string; on: boolean }) => {
      const params = { path: { ...path, shop_id: shopId } };
      const url = "/v1/organizations/{organization_id}/members/{membership_id}/shops/{shop_id}";
      const { error, response } = on
        ? await api.PUT(url, { params })
        : await api.DELETE(url, { params });
      if (!response.ok) throw apiError(response, error);
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async () => {
      const { error, response } = await api.DELETE(
        "/v1/organizations/{organization_id}/members/{membership_id}",
        { params: { path } },
      );
      if (!response.ok) throw apiError(response, error);
    },
    onSuccess: async () => {
      await refresh();
      onClose();
    },
  });

  if (member === undefined) return null;
  const name = member.display_name ?? t`Invited member`;
  const owner = member.role === "owner";
  const wide = ORGANIZATION_WIDE.includes(member.role);
  const message =
    accessMessage(changeRole.error) ?? accessMessage(grant.error) ?? accessMessage(remove.error);

  const Title = sheet ? Heading : "span";
  return (
    <Panel className={cx(sheet && "max-h-[86dvh]")} {...(sheet ? {} : { label: t`Member` })}>
      <PanelHeader
        title={
          <Title {...(sheet ? { slot: "title" } : {})} className="m-0 text-body-sm font-normal">
            <Trans>Member</Trans>
          </Title>
        }
        actions={
          <CircleButton
            label={sheet ? t`Close` : t`Back to inviting`}
            icon={<CloseIcon size={14} />}
            onClick={onClose}
          />
        }
      />
      <PanelBody className="gap-5">
        <div className="flex flex-col items-center gap-2">
          <Avatar initial={name.slice(0, 1)} size="lg" ink={owner} />
          <IdBlock label={t`Member:`} value={name} className="max-w-full" />
        </div>
        <KV
          items={[
            [t`Type`, t`Human`],
            [t`Role`, roleLabel(member.role)],
            [t`Access`, access(member)],
            [t`Status`, member.display_name === null ? t`Invited` : t`Active`],
          ]}
        />
        {owner ? (
          <p className="m-0 rounded-card bg-raised p-4 text-caption text-secondary">
            <Trans>The Owner's role, shops and membership cannot be changed.</Trans>
          </p>
        ) : (
          <>
            <ChoiceChips
              label={t`Change role`}
              value={member.role}
              isDisabled={changeRole.isPending}
              onChange={(role) => {
                changeRole.mutate(role);
              }}
              options={(actingOwner ? (["owner", ...INVITABLE] as Role[]) : INVITABLE).map(
                (id) => ({ id, label: roleLabel(id) }),
              )}
            />
            <section aria-labelledby={`shops-${memberId}`}>
              <SectionLabel id={`shops-${memberId}`}>
                <Trans>Shop access</Trans>
              </SectionLabel>
              {wide ? (
                <p className="m-0 text-caption text-secondary">
                  <Trans>Owners and Admins work in every shop of the workspace.</Trans>
                </p>
              ) : (shops.data ?? []).length === 0 ? (
                <p className="m-0 text-caption text-secondary">
                  <Trans>No shops yet. Connect one under Commerce › Shops.</Trans>
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col p-0">
                  {(shops.data ?? []).map((shop) => {
                    const on = member.shop_ids.includes(shop.id);
                    const shopName = shop.name;
                    return (
                      <li
                        key={shop.id}
                        className="flex items-center gap-3 py-2.5 [&+&]:border-t [&+&]:border-line"
                      >
                        <Avatar initial={shop.name.slice(0, 1)} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-body-sm">{shop.name}</span>
                        <Toggle
                          label={t`Access to ${shopName}`}
                          isSelected={on}
                          isDisabled={grant.isPending}
                          onChange={(next) => {
                            grant.mutate({ shopId: shop.id, on: next });
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            {message === undefined ? null : (
              <p role="alert" className="m-0 animate-enter text-body-sm text-danger-text">
                {message}
              </p>
            )}
            <div className="mt-auto flex flex-col gap-2">
              {confirming ? (
                <div className="flex animate-enter flex-col gap-2 rounded-card bg-raised p-3">
                  <p className="m-0 text-caption text-secondary">
                    {member.user_id === myId ? (
                      <Trans>Remove yourself from this workspace? You lose access at once.</Trans>
                    ) : (
                      <Trans>Remove {name} from this workspace? Their access ends at once.</Trans>
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onPress={() => {
                        setConfirming(false);
                      }}
                    >
                      <Trans>Cancel</Trans>
                    </Button>
                    <Button
                      variant="primary"
                      isPending={remove.isPending}
                      onPress={() => {
                        remove.mutate();
                      }}
                    >
                      <Trans>Remove</Trans>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onPress={() => {
                    setConfirming(true);
                  }}
                >
                  <Trans>Remove from workspace</Trans>
                </Button>
              )}
            </div>
          </>
        )}
      </PanelBody>
    </Panel>
  );
}

/** The approval policy beside the members: planned, so a demo; two-step sign-in is real. */
function PolicyPanel() {
  const { t } = useLingui();
  const api = useApi();
  const mfa = useQuery(mfaQuery(api));
  return (
    <Panel label={t`Policy`}>
      <PanelHeader title={<Trans>Policy</Trans>} actions={<DemoTag className="me-4" />} />
      <FlowBody className="max-w-[640px] gap-6">
        <DemoPart tag={false} contentClassName="flex flex-col gap-4">
          <IdBlock
            label={t`Policy version:`}
            value={<span className="ltr font-mono text-title-lg">2026-10-15.1</span>}
          />
          <KV
            items={[
              [
                t`Refund without approval`,
                <span key="a" className="ltr">
                  $0
                </span>,
              ],
              [
                t`Refund with approval`,
                <span key="b" className="ltr">
                  ≤ $20
                </span>,
              ],
              [t`Publish listing`, t`Approval`],
              [t`Change supplier`, t`Approval`],
            ]}
          />
        </DemoPart>
        <KV2
          items={[
            [
              t`Two-step sign-in:`,
              mfa.data === undefined ? (
                "…"
              ) : (
                <>
                  <Dot tone={mfa.data.enrolled ? "success" : "attention"} />
                  {mfa.data.enrolled ? t`On` : t`Off`}
                </>
              ),
            ],
            [
              t`Audit log:`,
              <span key="audit" className="inline-flex items-center gap-2 opacity-60">
                <Dot tone="ink" />
                {t`90 days`}
              </span>,
            ],
          ]}
        />
      </FlowBody>
    </Panel>
  );
}

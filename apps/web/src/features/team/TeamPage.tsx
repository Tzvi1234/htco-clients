import { Trans, useLingui } from "@lingui/react/macro";
import {
  CheckIcon as Check,
  CopyIcon as Copy,
  EnvelopeIcon as Envelope,
  UsersThreeIcon as UsersThree,
  WhatsappLogoIcon as WhatsappLogo,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type SyntheticEvent } from "react";
import {
  Input,
  Label,
  RadioButton,
  RadioField,
  RadioGroup,
  TextField as AriaTextField,
} from "react-aria-components";

import { FormAlert } from "../auth/AuthLayout.tsx";
import { ApiError, apiError, meQuery, useApi, type ApiClient } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { PageBody, PageHeader } from "../../shared/ui/PageHeader.tsx";
import { ObjectIcon, Tag, type Hue } from "../../shared/ui/Tag.tsx";
import { TextField } from "../../shared/ui/TextField.tsx";
import { CHIP, WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";

type Role = "owner" | "admin" | "operations" | "finance" | "support" | "developer" | "viewer";

const ROLE_HUES: Record<Role, Hue> = {
  owner: "iris",
  admin: "sky",
  operations: "mint",
  finance: "saffron",
  support: "coral",
  developer: "slate",
  viewer: "slate",
};

const INVITABLE: Role[] = ["admin", "operations", "finance", "support", "developer", "viewer"];

const CARD = "overflow-hidden rounded-card border border-border-subtle bg-surface shadow-1";
const CARD_HEADER =
  "m-0 border-b border-border-subtle bg-sunken px-4 py-2.5 text-body font-semibold";

function membersQuery(api: ApiClient, organizationId: string) {
  return {
    queryKey: ["organizations", organizationId, "members"] as const,
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

/** Who works in the organization, and inviting someone new (FR-IAM-02). Owners and Admins. */
export function TeamPage() {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const managed = (me.data?.memberships ?? [])
    .filter((m) => m.role === "owner" || m.role === "admin")
    .map((m) => m.organization_id);
  const [chosen, setChosen] = useState<string | null>(null);
  const organizationId = pickWorkspace(managed, chosen);

  return (
    <>
      <PageHeader
        title={<Trans>Team</Trans>}
        description={<Trans>Invite people and choose what they can do.</Trans>}
        icon={<ObjectIcon icon={UsersThree} />}
      />
      <PageBody>
        <div className="flex max-w-[760px] flex-col gap-4">
          {managed.length > 1 ? (
            <WorkspacePicker ids={managed} value={chosen} onChange={setChosen} />
          ) : null}
          {organizationId === undefined ? null : (
            <>
              <Invite key={organizationId} organizationId={organizationId} />
              <Members organizationId={organizationId} />
            </>
          )}
        </div>
      </PageBody>
    </>
  );
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

function Members({ organizationId }: { organizationId: string }) {
  const { t } = useLingui();
  const api = useApi();
  const members = useQuery(membersQuery(api, organizationId));
  const roleLabel = useRoleLabel();
  return (
    <section className={CARD} aria-labelledby="members">
      <h2 id="members" className={CARD_HEADER}>
        <Trans>Members</Trans>
      </h2>
      <ul aria-label={t`Members`} className="m-0 list-none p-0">
        {(members.data ?? []).map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-pill bg-sunken text-body-sm font-semibold text-secondary"
            >
              {(member.display_name ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 grow truncate font-medium">
              {member.display_name ?? t`Invited member`}
            </span>
            <Tag hue={ROLE_HUES[member.role]}>{roleLabel(member.role)}</Tag>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Invite({ organizationId }: { organizationId: string }) {
  const { t } = useLingui();
  const api = useApi();
  const queryClient = useQueryClient();
  const roleLabel = useRoleLabel();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [copied, setCopied] = useState(false);

  const invite = useMutation({
    mutationFn: async () => {
      const { data, error, response } = await api.POST(
        "/v1/organizations/{organization_id}/invitations",
        { params: { path: { organization_id: organizationId } }, body: { email, role } },
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

  function message(): string | undefined {
    const error = invite.error;
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
  }

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    invite.mutate();
  }

  const link = invite.data?.invite_link ?? null;
  const share = link === null ? null : t`You're invited to HT-Commerce: ${link}`;

  return (
    <section className={CARD} aria-labelledby="invite">
      <h2 id="invite" className={CARD_HEADER}>
        <Trans>Invite someone</Trans>
      </h2>
      <form className="flex flex-col gap-4 p-4" onSubmit={submit} noValidate>
        <TextField
          icon={Envelope}
          label={t`Email`}
          placeholder="name@company.com"
          type="email"
          ltr
          isRequired
          value={email}
          onChange={setEmail}
        />
        <RadioGroup
          value={role}
          onChange={(value) => {
            setRole(value as Role);
          }}
          orientation="horizontal"
          className="flex flex-col gap-2"
        >
          <Label className="text-body-sm font-medium text-secondary">{t`Role`}</Label>
          <div className="flex flex-wrap gap-2">
            {INVITABLE.map((value) => (
              <RadioField key={value} value={value}>
                <RadioButton className={CHIP}>{roleLabel(value)}</RadioButton>
              </RadioField>
            ))}
          </div>
        </RadioGroup>
        <FormAlert message={message()} />
        <Button type="submit" variant="primary" isPending={invite.isPending} className="self-start">
          <Trans>Invite</Trans>
        </Button>
      </form>
      {link === null || share === null ? null : (
        <div className="flex flex-col gap-3 border-t border-border-subtle bg-sunken p-4">
          <p className="m-0 text-body-sm text-secondary">
            <Trans>
              Send this link to them yourself. It works once; when it expires, invite them again.
            </Trans>
          </p>
          <AriaTextField aria-label={t`Invitation link`} value={link} isReadOnly>
            <Input
              dir="ltr"
              className="h-10 w-full rounded-control border border-border-control bg-surface px-3 font-mono text-body-sm outline-none"
              onFocus={(event) => {
                event.currentTarget.select();
              }}
            />
          </AriaTextField>
          <div className="flex flex-wrap gap-2">
            <Button
              onPress={() => {
                void navigator.clipboard.writeText(link).then(() => {
                  setCopied(true);
                });
              }}
            >
              {copied ? (
                <Check aria-hidden="true" size={16} weight="bold" />
              ) : (
                <Copy aria-hidden="true" size={16} weight="duotone" />
              )}
              {copied ? <Trans>Copied</Trans> : <Trans>Copy link</Trans>}
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(share)}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-9 items-center gap-1.5 rounded-button border border-border-subtle bg-surface px-3 text-body-sm font-semibold text-primary no-underline hover:bg-hover"
            >
              <WhatsappLogo aria-hidden="true" size={16} weight="duotone" />
              <Trans>Send on WhatsApp</Trans>
            </a>
          </div>
          <p className="m-0 text-caption text-muted">
            {t`Role`}: {roleLabel(invite.data?.role ?? role)}
          </p>
        </div>
      )}
    </section>
  );
}

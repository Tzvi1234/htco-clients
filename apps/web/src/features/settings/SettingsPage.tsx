import { Trans, useLingui } from "@lingui/react/macro";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AppearanceChoices } from "./AppearanceChoices.tsx";
import {
  integrationsQuery,
  meQuery,
  mfaQuery,
  sessionsQuery,
  shopsQuery,
  useApi,
} from "../../shared/api/api.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Avatar,
  DemoPart,
  DemoTag,
  ListRow,
  PillValue,
  Sep,
  ShieldGlyph,
  Status,
  Toggle,
  NextGlyph,
} from "../../shared/ui/kit/index.ts";

/** Sections enter one after another, 40 ms apart; nothing moves under reduced motion. */
const ENTER =
  "[&>*]:motion-safe:animate-enter [&>*:nth-child(2)]:[animation-delay:40ms] [&>*:nth-child(3)]:[animation-delay:80ms]";

/**
 * Settings (FR-ADM-01), redesigned in round 3 for calm: one page that scrolls as a whole (no
 * panel scrolls on its own), in three clear groups.
 *
 * 1. Appearance and language: the three personal settings (theme, palette, language), on this
 *    device and shared with the landing page. They are the only personalisation; the top bar
 *    no longer carries any.
 * 2. Access and connections: Members & access and Security (each a page of its own), and the
 *    real Etsy connection beside the planned suppliers, alerts and files.
 * 3. Coming later: the business details and notifications, dimmed and tagged as demos.
 */
export function SettingsPage() {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={t`Settings`} />
      <div className={cx("flex flex-col gap-2", ENTER)}>
        <AppearancePanel />
        <div className="grid gap-2 md:grid-cols-2">
          <AccessPanel />
          <ConnectionsPanel />
        </div>
        <LaterSection />
      </div>
    </>
  );
}

/** The three personal settings, in one panel at the top. */
function AppearancePanel() {
  const { t } = useLingui();
  return (
    <Panel label={t`Appearance and language`}>
      <PanelHeader
        title={<Trans>Appearance and language</Trans>}
        meta={<Trans>On this device</Trans>}
      />
      <PanelBody className="pt-1">
        <AppearanceChoices />
      </PanelBody>
    </Panel>
  );
}

/** The planned settings, together and clearly apart from the real ones. */
function LaterSection() {
  const { t } = useLingui();
  return (
    <section aria-labelledby="settings-later" className="flex flex-col gap-3 pt-6">
      {/* A section heading on the ground, on the panels' own text line (their 24 px gutter). */}
      <div className="flex items-baseline gap-2.5 px-6">
        <h2 id="settings-later" className="m-0 text-title-sm font-light text-primary">
          <Trans>Coming later</Trans>
        </h2>
        <p className="m-0 text-caption text-secondary">
          <Trans>Planned settings, shown as demos.</Trans>
        </p>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <Panel label={t`Business details`}>
          <PanelHeader
            title={<Trans>Business details</Trans>}
            actions={<DemoTag className="me-4" />}
          />
          <PanelBody className="pt-0">
            <DemoPart contentClassName="flex flex-col gap-4" tag={false}>
              <PillValue
                label={t`Business name`}
                value={<span className="ltr">HT Commerce</span>}
              />
              <PillValue label={t`Time zone`} value={<span className="ltr">Asia/Jerusalem</span>} />
              <PillValue label={t`Currency`} value={<span className="ltr">USD $</span>} />
            </DemoPart>
          </PanelBody>
        </Panel>
        <NotificationsPanel />
      </div>
    </section>
  );
}

/** A row that opens another page: an icon disc, a title and a line, the end arrow. */
function LinkRow({
  to,
  icon,
  title,
  line,
}: {
  to: "/settings/team" | "/settings/security";
  icon: ReactNode;
  title: ReactNode;
  line: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group -mx-3 flex items-center gap-3 rounded-card px-3 py-2.5 text-primary no-underline outline-none transition-colors duration-[var(--motion-duration-fast)] hover:bg-hover focus-visible:outline-2 focus-visible:outline-focus"
    >
      {icon}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body">{title}</span>
        <span className="truncate text-caption text-secondary">{line}</span>
      </span>
      <NextGlyph
        size={14}
        className="shrink-0 text-icon transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
      />
    </Link>
  );
}

/** Members & access (Owners and Admins) and Security, each a page of its own. */
function AccessPanel() {
  const { t } = useLingui();
  const api = useApi();
  const me = useQuery(meQuery(api));
  const mfa = useQuery(mfaQuery(api));
  const sessions = useQuery(sessionsQuery(api));
  const managesTeam =
    me.data?.memberships.some((m) => m.role === "owner" || m.role === "admin") ?? false;
  const devices = sessions.data?.length;
  return (
    <Panel label={t`Access and security`}>
      <PanelHeader title={<Trans>Access and security</Trans>} />
      <PanelBody className="gap-1">
        {managesTeam ? (
          <LinkRow
            to="/settings/team"
            icon={<Avatar initial="+" size="md" ink />}
            title={<Trans>Members & access</Trans>}
            line={<Trans>Invite people and choose what they can do.</Trans>}
          />
        ) : null}
        <LinkRow
          to="/settings/security"
          icon={
            <span className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-line bg-raised">
              <ShieldGlyph size={16} />
            </span>
          }
          title={<Trans>Security</Trans>}
          line={
            mfa.data === undefined ? (
              <Trans>How you sign in, and where you are signed in.</Trans>
            ) : (
              <span className="inline-flex items-center">
                <Status
                  live
                  status={mfa.data.enrolled ? "running" : "waityou"}
                  label={mfa.data.enrolled ? t`Two-step sign-in on` : t`Two-step sign-in off`}
                />
                {devices === undefined ? null : (
                  <>
                    <Sep className="mx-2" />
                    <span className="text-muted">
                      {devices === 1 ? t`1 device` : t`${devices} devices`}
                    </span>
                  </>
                )}
              </span>
            )
          }
        />
      </PanelBody>
    </Panel>
  );
}

/** Alerts by Telegram and email: planned (Phase 5), so a demo. */
function NotificationsPanel() {
  const { t } = useLingui();
  const rows = [
    [t`Approval requests`, t`Instant Telegram alert`, true],
    [t`System incidents`, t`When an automation fails`, true],
    [t`Daily summary`, t`Every morning at 08:00`, false],
  ] as const;
  return (
    <Panel label={t`Notifications`}>
      <PanelHeader title={<Trans>Notifications</Trans>} actions={<DemoTag className="me-4" />} />
      <PanelBody className="pt-0">
        <DemoPart tag={false}>
          {rows.map(([title, line, on]) => (
            <ListRow
              key={title}
              title={title}
              line={line}
              className="py-4"
              end={<Toggle label={title} isSelected={on} />}
            />
          ))}
        </DemoPart>
      </PanelBody>
    </Panel>
  );
}

/**
 * Connections: Etsy is real — its shops and, for Owners and Admins, how many are connected now
 * (from the shops and integrations API). Suppliers, alert channels and storage are planned, so
 * each is a demo row.
 */
function ConnectionsPanel() {
  const { t } = useLingui();
  const api = useApi();
  const me = useQuery(meQuery(api));
  const memberships = me.data?.memberships ?? [];
  // Every workspace the user belongs to, as the sidebar's shop card counts them.
  const shops = useQueries({
    queries: memberships.map((m) => shopsQuery(api, m.organization_id)),
    combine: (results) =>
      results.some((r) => r.data === undefined)
        ? undefined
        : results.reduce((sum, r) => sum + (r.data?.length ?? 0), 0),
  });
  // Connection health is for Owners and Admins; it is shown only when it covers every workspace.
  const manages =
    memberships.length > 0 && memberships.every((m) => m.role === "owner" || m.role === "admin");
  const connected = useQueries({
    queries: (manages ? memberships : []).map((m) => integrationsQuery(api, m.organization_id)),
    combine: (results) =>
      !manages || results.some((r) => r.data === undefined)
        ? undefined
        : results.reduce(
            (sum, r) => sum + (r.data ?? []).filter((i) => i.status === "connected").length,
            0,
          ),
  });
  const count = me.data === undefined ? undefined : shops;
  const shopsLine = count === undefined ? "…" : count === 1 ? t`1 shop` : t`${count} shops`;
  return (
    <Panel label={t`Connections`}>
      <PanelHeader title={<Trans>Connections</Trans>} />
      <PanelBody className="pt-0">
        <Link
          to="/shops"
          className="-mx-3 flex items-center gap-3 rounded-card px-3 py-3.5 text-primary no-underline outline-none transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-focus"
        >
          <Avatar initial="E" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body">
              <span className="ltr">Etsy</span>
            </span>
            <span className="block truncate text-caption text-secondary">{shopsLine}</span>
          </span>
          {count === undefined ? null : count === 0 ? (
            <Status live status="offline" label={t`Not connected`} />
          ) : connected === undefined ? null : connected === count ? (
            <Status live status="running" label={t`Connected`} />
          ) : (
            <Status live status="waityou" label={t`${connected} of ${count} connected`} />
          )}
        </Link>
        {(
          [
            ["Printful", t`Supplier`, "running"],
            ["Telegram", t`Alerts`, "running"],
            ["Google Drive", t`Files`, "offline"],
          ] as const
        ).map(([name, line, state]) => (
          <div key={name} className="border-t border-line">
            {/* The tag sits beside the sample status, in one column for every row. */}
            <DemoPart tagClassName="inset-e-[108px] top-1/2 -translate-y-1/2">
              <ListRow
                className="py-3.5"
                lead={<Avatar initial={name.slice(0, 1)} />}
                title={<span className="ltr">{name}</span>}
                line={line}
                end={
                  <span className="inline-flex min-w-24 justify-end">
                    <Status
                      live
                      status={state}
                      label={state === "running" ? t`Connected` : t`Off`}
                    />
                  </span>
                }
              />
            </DemoPart>
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

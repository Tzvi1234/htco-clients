import { Trans, useLingui } from "@lingui/react/macro";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";

import {
  integrationsQuery,
  meQuery,
  mfaQuery,
  sessionsQuery,
  shopsQuery,
  useApi,
} from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { useTweaks } from "../../shared/theme/ThemeProvider.tsx";
import { levelsApply, type Level, type Palette } from "../../shared/theme/tweaks.ts";
import type { ThemePreference } from "../../shared/theme/theme.ts";
import { ArrowEndIcon } from "../../shared/ui/icons.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import { LevelDots, Segmented } from "../../shared/ui/Segmented.tsx";
import { cx } from "../../shared/lib/cx.ts";
import {
  Avatar,
  DemoPart,
  DemoTag,
  ListRow,
  PillSelect,
  PillValue,
  Screen,
  ShieldGlyph,
  Stack,
  Status,
  Toggle,
} from "../../shared/ui/kit/index.ts";

/**
 * Settings (FR-ADM-01), the Design 1C screen (`P.settings`): the interface language, the design
 * tweaks (one preference with the top bar's tweaks panel), access and security, and the planned
 * business settings, notifications and connections as demos.
 */
export function SettingsPage() {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={t`Settings`} />
      <Screen layout="lc3">
        <Stack className="lg:grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <GeneralPanel />
          <AccessPanel />
        </Stack>
        <AppearancePanel />
        <Stack>
          <NotificationsPanel />
          <ConnectionsPanel />
        </Stack>
      </Screen>
    </>
  );
}

function GeneralPanel() {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  return (
    <Panel label={t`General`}>
      <PanelHeader title={<Trans>General</Trans>} />
      <PanelBody className="gap-4">
        <PillSelect
          label={t`Interface language`}
          value={locale}
          onChange={setLocale}
          options={[
            { id: "he", label: "עברית", lang: "he", textValue: "עברית" },
            { id: "en", label: "English", lang: "en", textValue: "English" },
          ]}
        />
        <DemoPart contentClassName="flex flex-col gap-4" tag="edge">
          <PillValue label={t`Business name`} value={<span className="ltr">HT Commerce</span>} />
          <PillValue label={t`Time zone`} value={<span className="ltr">Asia/Jerusalem</span>} />
          <PillValue label={t`Currency`} value={<span className="ltr">USD $</span>} />
        </DemoPart>
      </PanelBody>
    </Panel>
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
      <ArrowEndIcon
        size={14}
        className="shrink-0 text-icon transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
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
              <span className="inline-flex items-center gap-2">
                <Status
                  live
                  status={mfa.data.enrolled ? "running" : "waityou"}
                  label={mfa.data.enrolled ? t`Two-step sign-in on` : t`Two-step sign-in off`}
                />
                {devices === undefined ? null : (
                  <span className="text-muted">
                    · {devices === 1 ? t`1 device` : t`${devices} devices`}
                  </span>
                )}
              </span>
            )
          }
        />
      </PanelBody>
    </Panel>
  );
}

/** A setting row in the demo's list language: title and caption, the control at the end. */
function SettingRow({
  title,
  caption,
  disabled = false,
  wide = false,
  children,
}: {
  title: string;
  caption: string;
  disabled?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex gap-3 py-4 transition-opacity duration-[var(--motion-duration-fast)] [&+&]:border-t [&+&]:border-line",
        wide ? "flex-col" : "items-center justify-between",
        disabled && "opacity-45",
      )}
    >
      <div className="min-w-0">
        <div className="text-body">{title}</div>
        <div className="text-caption text-secondary">{caption}</div>
      </div>
      {children}
    </div>
  );
}

/**
 * The design tweaks as a settings panel: the same preference as the top bar's tweaks panel, so
 * a change in either shows in both.
 */
function AppearancePanel() {
  const { t } = useLingui();
  const { tweaks, setTweak, resetTweaks } = useTweaks();
  const levels: Record<Level, string> = { 1: t`Normal`, 2: t`Different`, 3: t`Very different` };
  const levelOptions = ([1, 2, 3] as const).map((level) => ({
    id: String(level) as `${Level}`,
    label: levels[level],
    content: <LevelDots level={level} />,
  }));
  const palettes: Record<Palette, { short: string; caption: string }> = {
    sbb: { short: "SBB", caption: t`Gray and orange` },
    d4: { short: t`Design 4`, caption: t`Cream, lilac, orchid and lemon` },
    plain: { short: t`Plain ground`, caption: t`Gray, with no blooms behind the glass` },
  };
  const themes: Record<ThemePreference, string> = {
    system: t`Match the system`,
    light: t`Light`,
    dark: t`Dark`,
  };
  const fixed = !levelsApply(tweaks.palette);
  const level = (name: "contrast" | "glass" | "borders", title: string, disabled = false) => (
    <SettingRow title={title} caption={levels[tweaks[name]]} disabled={disabled}>
      <Segmented
        size="sm"
        label={title}
        value={String(tweaks[name]) as `${Level}`}
        onChange={(value) => {
          setTweak(name, Number(value) as Level);
        }}
        options={levelOptions}
        isDisabled={disabled}
      />
    </SettingRow>
  );
  return (
    <Panel label={t`Appearance`}>
      <PanelHeader
        title={<Trans>Appearance</Trans>}
        meta={<Trans>On this device</Trans>}
        actions={
          <AriaButton
            onPress={resetTweaks}
            className="-my-1 me-4 cursor-default rounded-pill px-1.5 py-1 text-caption text-muted underline underline-offset-[3px] outline-none data-[hovered]:text-primary data-[focus-visible]:outline-2 data-[focus-visible]:outline-focus"
          >
            {t`Reset`}
          </AriaButton>
        }
      />
      <PanelBody className="pt-0">
        <SettingRow title={t`Theme`} caption={t`Light, dark, or as the device is set`} wide>
          <Segmented
            label={t`Theme`}
            value={tweaks.theme}
            onChange={(value) => {
              setTweak("theme", value);
            }}
            options={(["system", "light", "dark"] as const).map((id) => ({
              id,
              label: themes[id],
            }))}
            className="h-10 w-full [&>*]:h-8 [&>*]:flex-1"
          />
        </SettingRow>
        <SettingRow title={t`Palette and ground`} caption={palettes[tweaks.palette].caption} wide>
          <Segmented
            label={t`Palette and ground`}
            value={tweaks.palette}
            onChange={(value) => {
              setTweak("palette", value);
            }}
            options={(["sbb", "d4", "plain"] as const).map((id) => ({
              id,
              label: palettes[id].short,
            }))}
            className="h-10 w-full [&>*]:h-8 [&>*]:flex-1"
          />
        </SettingRow>
        {level("contrast", t`Element vs. ground contrast`, fixed)}
        {level("glass", t`Frosted glass`)}
        {level("borders", t`Element borders`, fixed)}
        {fixed ? (
          <p className="m-0 animate-enter pt-1 text-caption font-light text-muted">
            {t`With the Design 4 palette, contrast and borders come from the palette; glass still applies.`}
          </p>
        ) : null}
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
    <Panel label={t`Notifications`} className="max-sm:hidden">
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
            <DemoPart tagClassName="end-[108px] top-1/2 -translate-y-1/2">
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

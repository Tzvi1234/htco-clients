import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import {
  apiError,
  authKeys,
  mfaQuery,
  sessionQuery,
  sessionsQuery,
  useApi,
  type SessionItem,
} from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  DemoPart,
  DemoTag,
  Dot,
  IdBlock,
  KV,
  KV2,
  LaptopGlyph,
  ListRow,
  PhoneGlyph,
  Screen,
  ShieldGlyph,
  Stack,
  Status,
} from "../../shared/ui/kit/index.ts";

/**
 * Security (slice 3.5, AC-3.5.4, FR-IAM-05), a page of Settings in the Design 1C language: the
 * second factor beside the signed-in devices, each of which can be signed out.
 */
export function SecurityPage() {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={t`Security`} />
      <Screen layout="l2">
        <Stack className="lg:grid-rows-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <SecondFactor />
          <RecoveryDemo />
        </Stack>
        <Devices />
      </Screen>
    </>
  );
}

function SecondFactor() {
  const { t } = useLingui();
  const api = useApi();
  const mfa = useQuery(mfaQuery(api));
  const session = useQuery(sessionQuery(api));
  const enrolled = mfa.data?.enrolled;
  return (
    <Panel label={t`Two-factor sign-in`}>
      <PanelHeader title={<Trans>Two-factor sign-in</Trans>} />
      <PanelBody className="justify-between gap-5">
        <div className="flex flex-col items-center gap-3 pt-2">
          <span className="flex size-16 items-center justify-center rounded-pill border border-line bg-raised">
            <ShieldGlyph size={24} />
          </span>
          <IdBlock
            label={t`Two-step sign-in:`}
            value={enrolled === undefined ? "…" : enrolled ? t`On` : t`Off`}
          />
        </div>
        <KV
          items={[
            [t`Method`, t`Authenticator app`],
            [
              t`Codes set up`,
              <span key="n" className="ltr">
                {mfa.data?.factors.filter((f) => f.verified).length ?? "…"}
              </span>,
            ],
            [
              t`This session`,
              session.data?.assurance === "aal2" ? t`Confirmed with a code` : t`Password only`,
            ],
            [t`Required for`, t`Owners and Admins`],
          ]}
        />
        {enrolled === undefined ? null : enrolled ? (
          <p className="m-0 flex animate-enter items-center justify-center gap-2 rounded-card bg-raised p-3 text-body-sm">
            <Status
              live
              status="running"
              label={
                <span className="text-body-sm">
                  <Trans>Authenticator app is set up</Trans>
                </span>
              }
            />
          </p>
        ) : (
          <p className="m-0 flex animate-enter flex-wrap items-center justify-center gap-2 rounded-card bg-raised p-3 text-body-sm">
            <Status
              live
              status="waityou"
              label={
                <span className="text-body-sm">
                  <Trans>No authenticator app yet.</Trans>
                </span>
              }
            />{" "}
            <Link to="/security/setup" className="text-link underline underline-offset-[3px]">
              <Trans>Set one up</Trans>
            </Link>
          </p>
        )}
      </PanelBody>
    </Panel>
  );
}

/** Recovery codes and passkeys: planned with MFA recovery, so a demo. */
function RecoveryDemo() {
  const { t } = useLingui();
  return (
    <Panel label={t`Recovery`} className="max-sm:hidden">
      <PanelHeader title={<Trans>Recovery</Trans>} actions={<DemoTag className="me-4" />} />
      <PanelBody className="justify-between gap-4">
        <DemoPart tag={false} contentClassName="flex flex-col gap-4">
          <IdBlock label={t`Recovery codes left:`} value={<span className="ltr">8 / 10</span>} />
          <KV2
            items={[
              [
                t`Last used:`,
                <>
                  <Dot tone="ink" />
                  {t`Never`}
                </>,
              ],
              [
                t`Passkey:`,
                <>
                  <Dot tone="muted" />
                  {t`Off`}
                </>,
              ],
            ]}
          />
        </DemoPart>
      </PanelBody>
    </Panel>
  );
}

function Devices() {
  const { t } = useLingui();
  const { locale } = useLocale();
  const api = useApi();
  const queryClient = useQueryClient();
  const sessions = useQuery(sessionsQuery(api));
  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await api.DELETE("/v1/auth/sessions/{session_id}", {
        params: { path: { session_id: id } },
      });
      if (!response.ok) throw apiError(response, error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.sessions }),
  });
  const seen = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const count = sessions.data?.length;

  return (
    <Panel label={t`Signed-in devices`} className="max-lg:min-h-[320px]">
      <PanelHeader
        title={<Trans>Signed-in devices</Trans>}
        meta={count === undefined ? undefined : <span className="ltr">{count}</span>}
      />
      <PanelBody className="px-2 pb-2">
        {sessions.isError ? (
          <p role="alert" className="m-0 px-4 py-3 text-body-sm text-danger-text">
            <Trans>The devices cannot be loaded right now. Try again shortly.</Trans>
          </p>
        ) : null}
        {revoke.isError ? (
          <p role="alert" className="m-0 px-4 py-3 text-body-sm text-danger-text">
            <Trans>That device is still signed in. Try again shortly.</Trans>
          </p>
        ) : null}
        <ul aria-label={t`Signed-in devices`} className="m-0 flex list-none flex-col gap-1 p-0">
          {(sessions.data ?? []).map((session: SessionItem, index) => {
            const device = session.user_agent ?? t`Unknown device`;
            const mobile = /android|iphone|ipad|mobile/i.test(device);
            return (
              <li
                key={session.id}
                style={{ animationDelay: `${String(index * 40)}ms` }}
                className={
                  "flex animate-[htco-row-in_280ms_var(--motion-easing-enter)_both] items-center gap-3 rounded-card p-3 transition-colors duration-[var(--motion-duration-fast)] " +
                  (session.current ? "bg-selected" : "hover:bg-hover")
                }
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-line bg-raised">
                  {mobile ? <PhoneGlyph size={16} /> : <LaptopGlyph size={16} />}
                </span>
                <ListRow
                  className="min-w-0 flex-1 py-0"
                  wrapLine
                  title={device}
                  line={
                    session.current ? (
                      <Status live status="running" label={<Trans>This device</Trans>} />
                    ) : (
                      <Trans>Last active {seen.format(new Date(session.last_seen_at))}</Trans>
                    )
                  }
                />
                {session.current ? null : (
                  <Button
                    aria-label={t`Sign out ${device}`}
                    isPending={revoke.isPending && revoke.variables === session.id}
                    onPress={() => {
                      revoke.mutate(session.id);
                    }}
                  >
                    <Trans>Sign out</Trans>
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </PanelBody>
    </Panel>
  );
}

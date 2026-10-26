import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Passkeys } from "./Passkeys.tsx";
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
import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Aside,
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
  KV2,
  LaptopGlyph,
  ListRow,
  N,
  Note,
  PhoneGlyph,
  ShieldGlyph,
  Status,
} from "../../shared/ui/kit/index.ts";

/**
 * Security (slice 3.5, AC-3.5.4, FR-IAM-05), a page of Settings (clarity round 3): the second
 * factor as the focus on top, with the one thing to do when it is missing, then the signed-in
 * devices, each of which can be signed out, beside recovery (Demo until MFA recovery is built).
 */
export function SecurityPage() {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={t`Security`} />
      <Flow>
        <SecondFactor />
        <FlowRow layout="main-side">
          <Devices />
          <Aside>
            <Passkeys />
            <RecoveryDemo />
          </Aside>
        </FlowRow>
      </Flow>
    </>
  );
}

function SecondFactor() {
  const { t } = useLingui();
  const api = useApi();
  const mfa = useQuery(mfaQuery(api));
  const session = useQuery(sessionQuery(api));
  const sessions = useQuery(sessionsQuery(api));
  const enrolled = mfa.data?.enrolled;
  return (
    <Focus
      label={t`Two-factor sign-in`}
      title={<Trans>Two-factor sign-in</Trans>}
      meta={<Trans>Required for Owners and Admins</Trans>}
      lead={
        enrolled === undefined ? undefined : enrolled ? (
          mfa.data?.factors.some((f) => f.kind === "webauthn" && f.verified) === true ? (
            <Trans>
              Signing in asks for your passkey or a code from your authenticator app, so a password
              alone is not enough.
            </Trans>
          ) : (
            <Trans>
              Signing in asks for a code from your authenticator app, so a password alone is not
              enough.
            </Trans>
          )
        ) : (
          <Trans>
            Add an authenticator app: without it, a stolen password is enough to get in.
          </Trans>
        )
      }
      figures={
        <Figures label={t`Security numbers`}>
          <Figure
            label={t`Two-step sign-in`}
            value={enrolled === undefined ? "…" : enrolled ? t`On` : t`Off`}
            tone={enrolled === false ? "tertiary" : undefined}
          />
          <Figure
            label={t`Second factors`}
            value={<N>{String(mfa.data?.factors.filter((f) => f.verified).length ?? "…")}</N>}
            note={mfa.data?.passkeys === true ? t`Apps and passkeys` : t`Authenticator app`}
          />
          <Figure
            label={t`This session`}
            value={
              <span className="text-title-lg">
                {session.data?.assurance === "aal2" ? t`Two-step confirmed` : t`Password only`}
              </span>
            }
          />
          <Figure
            label={t`Signed-in devices`}
            value={<N>{sessions.data === undefined ? "…" : String(sessions.data.length)}</N>}
          />
        </Figures>
      }
      actions={
        enrolled === undefined ? undefined : enrolled ? (
          <p className="m-0 flex animate-enter items-center gap-2 text-body-sm">
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
          <>
            <Link to="/security/setup" className={buttonStyle({ variant: "primary", size: "lg" })}>
              <Trans>Set one up</Trans>
            </Link>
            <span className="text-body-sm text-secondary">
              <Trans>No authenticator app yet.</Trans>
            </span>
          </>
        )
      }
      aside={
        <span className="flex size-28 items-center justify-center rounded-pill border border-line bg-raised">
          <ShieldGlyph size={40} />
        </span>
      }
    />
  );
}

/** Recovery codes: planned with MFA recovery, so a demo. Passkeys are real (issue #113). */
function RecoveryDemo() {
  const { t } = useLingui();
  return (
    <Panel label={t`Recovery`}>
      <PanelHeader title={<Trans>Recovery</Trans>} actions={<DemoTag className="me-4" />} />
      <FlowBody className="gap-4">
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
            ]}
          />
        </DemoPart>
      </FlowBody>
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
    <Panel label={t`Signed-in devices`}>
      <PanelHeader
        title={<Trans>Signed-in devices</Trans>}
        meta={count === undefined ? undefined : <span className="ltr">{count}</span>}
      />
      <FlowBody className="px-2 pb-2 max-sm:px-2">
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
                  (session.current ? "bg-selected" : "")
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
                      <Trans>
                        Last active <bdi>{seen.format(new Date(session.last_seen_at))}</bdi>
                      </Trans>
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
        {sessions.data === undefined ? null : (
          <Note icon={<ShieldGlyph size={16} />} className="mx-2 mt-3 mb-2">
            <Trans>
              Don’t recognise a device? Sign it out here. Only that device is signed out; this one
              stays signed in.
            </Trans>
          </Note>
        )}
      </FlowBody>
    </Panel>
  );
}

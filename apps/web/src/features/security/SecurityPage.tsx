import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import {
  apiError,
  authKeys,
  mfaQuery,
  sessionsQuery,
  useApi,
  type SessionItem,
} from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { StatusDot } from "../../shared/ui/StatusDot.tsx";

const CARD = "flex flex-col gap-3 rounded-card border border-border-subtle bg-surface p-4";

/** Two-factor sign-in and the user's signed-in devices (slice 3.5, AC-3.5.4). */
export function SecurityPage() {
  return (
    <>
      <PageHeader
        title={<Trans>Security</Trans>}
        description={<Trans>How you sign in, and where you are signed in.</Trans>}
      />
      <div className="flex max-w-[720px] flex-col gap-4">
        <SecondFactor />
        <Devices />
      </div>
    </>
  );
}

function SecondFactor() {
  const api = useApi();
  const mfa = useQuery(mfaQuery(api));
  return (
    <section className={CARD} aria-labelledby="second-factor">
      <h2 id="second-factor" className="m-0 text-body font-semibold">
        <Trans>Two-factor sign-in</Trans>
      </h2>
      {mfa.data === undefined ? null : mfa.data.enrolled ? (
        <p className="m-0 flex items-center gap-2 text-body">
          <StatusDot status="done" />
          <Trans>Authenticator app is set up</Trans>
        </p>
      ) : (
        <p className="m-0 flex flex-wrap items-center gap-2 text-body">
          <StatusDot status="needs-you" />
          <Trans>No authenticator app yet.</Trans>{" "}
          <Link to="/security/setup" className="text-link underline">
            <Trans>Set one up</Trans>
          </Link>
        </p>
      )}
    </section>
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

  return (
    <section className={CARD} aria-labelledby="devices">
      <h2 id="devices" className="m-0 text-body font-semibold">
        <Trans>Signed-in devices</Trans>
      </h2>
      <ul aria-label={t`Signed-in devices`} className="m-0 flex list-none flex-col gap-2 p-0">
        {(sessions.data ?? []).map((session: SessionItem) => {
          const device = session.user_agent ?? t`Unknown device`;
          return (
            <li
              key={session.id}
              className="flex items-center justify-between gap-3 border-t border-border-subtle pt-2 first:border-t-0 first:pt-0"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-body">{device}</span>
                <span className="text-caption text-muted">
                  {session.current ? (
                    <Trans>This device</Trans>
                  ) : (
                    <Trans>Last active {seen.format(new Date(session.last_seen_at))}</Trans>
                  )}
                </span>
              </div>
              {session.current ? null : (
                <Button
                  size="sm"
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
    </section>
  );
}

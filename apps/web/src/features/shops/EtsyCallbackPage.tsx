import { Trans, useLingui } from "@lingui/react/macro";
import { StorefrontIcon as Storefront } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { ApiError, apiError, shopKeys, useApi } from "../../shared/api/api.tsx";
import { ErrorState } from "../../shared/ui/ErrorState.tsx";
import { PageBody, PageHeader } from "../../shared/ui/PageHeader.tsx";
import { ObjectIcon } from "../../shared/ui/Tag.tsx";

/** What Etsy put in the address when it sent the owner back. */
export interface EtsyReturn {
  code?: string;
  state?: string;
  error?: string;
}

export function etsyReturn(search: unknown): EtsyReturn {
  const text = (key: string): string | undefined => {
    if (typeof search !== "object" || search === null || !(key in search)) return undefined;
    const value: unknown = (search as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  };
  const result: EtsyReturn = {};
  const code = text("code");
  const state = text("state");
  const error = text("error");
  if (code !== undefined) result.code = code;
  if (state !== undefined) result.state = state;
  if (error !== undefined) result.error = error;
  return result;
}

type Outcome = { kind: "cancelled" } | { kind: "incomplete" } | { kind: "failed"; type?: string };

/**
 * Where Etsy sends the owner back (slice 4.3). The code and state leave the address bar at once,
 * are sent to the API exactly once (also under StrictMode), and the owner lands on Shops.
 */
export function EtsyCallbackPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => etsyReturn(s.location.search) });
  // Read once: the address is cleaned on the first render.
  const [sent] = useState(search);
  const early: Outcome | null =
    sent.error !== undefined
      ? sent.error === "access_denied"
        ? { kind: "cancelled" }
        : { kind: "failed" }
      : sent.code === undefined
        ? { kind: "incomplete" }
        : null;
  const started = useRef(false);
  const [failure, setFailure] = useState<Outcome | null>(null);
  const outcome = early ?? failure;

  const finish = useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string | undefined }) => {
      const { data, error, response } = await api.POST("/v1/integrations/etsy/callback", {
        body: { code, ...(state === undefined ? {} : { state }) },
      });
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: shopKeys.all });
      await navigate({
        to: "/shops",
        replace: true,
        state: { etsy: data.reconnected ? "reconnected" : "connected" },
      });
    },
    onError: (error) => {
      setFailure(
        error instanceof ApiError && error.type !== undefined
          ? { kind: "failed", type: error.type }
          : { kind: "failed" },
      );
    },
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void navigate({ to: "/integrations/etsy/callback", search: {}, replace: true });
    if (sent.error === undefined && sent.code !== undefined)
      finish.mutate({ code: sent.code, state: sent.state });
  }, [finish, navigate, sent]);

  return (
    <>
      <PageHeader
        title={<Trans>Connecting Etsy</Trans>}
        icon={<ObjectIcon hue="coral" icon={Storefront} />}
      />
      <PageBody>
        {outcome === null ? (
          <div
            role="status"
            className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-3 rounded-dialog border border-border-subtle bg-surface px-6 py-10 text-center shadow-1"
          >
            <span
              aria-hidden="true"
              className="size-5 animate-spin rounded-pill border-2 border-icon border-e-transparent"
            />
            <p className="m-0 font-display text-title-sm font-semibold">
              <Trans>Connecting your Etsy shop</Trans>
            </p>
            <p className="m-0 text-secondary">
              <Trans>This takes a few seconds. Keep this page open.</Trans>
            </p>
          </div>
        ) : (
          <Failure outcome={outcome} />
        )}
      </PageBody>
    </>
  );
}

function Failure({ outcome }: { outcome: Outcome }) {
  const { t } = useLingui();

  function reason(): string {
    if (outcome.kind === "cancelled") return t`You cancelled the connection on Etsy.`;
    if (outcome.kind === "incomplete")
      return t`This connection link is incomplete. Start again from Shops.`;
    switch (outcome.type) {
      case "etsy-state-rejected":
        return t`This connection link has expired or was already used. Start again from Shops.`;
      case "etsy-authorization-refused":
        return t`Etsy did not accept the connection. Start again from Shops.`;
      case "etsy-unreachable":
        return t`Etsy did not answer. Nothing was saved. Try again in a few minutes.`;
      case "etsy-no-shop":
        return t`This Etsy account has no shop yet. Open a shop on Etsy, then connect it.`;
      case "etsy-shop-connected-elsewhere":
        return t`This Etsy shop is already connected to another workspace.`;
      case "web-session-required":
        return t`Finish connecting in the web app where you are signed in.`;
      case "etsy-unavailable":
        return t`Connecting shops is unavailable right now. Try again in a few minutes.`;
      default:
        return t`The shop could not be connected. Start again from Shops.`;
    }
  }

  return (
    <ErrorState
      title={
        outcome.kind === "cancelled" ? (
          <Trans>Connection cancelled</Trans>
        ) : (
          <Trans>The shop was not connected</Trans>
        )
      }
      description={reason()}
    >
      <Link
        to="/shops"
        className="inline-flex h-8 items-center rounded-button bg-action-primary px-3 text-body font-medium text-action-primary-fg no-underline shadow-1 outline-none hover:bg-action-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Trans>Back to shops</Trans>
      </Link>
    </ErrorState>
  );
}

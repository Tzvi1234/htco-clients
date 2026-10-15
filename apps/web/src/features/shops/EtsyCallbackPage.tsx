import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { ApiError, apiError, shopKeys, useApi } from "../../shared/api/api.tsx";
import parcel from "../../assets/commerce/parcel.webp";
import { cx } from "../../shared/lib/cx.ts";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { IdBlock } from "../../shared/ui/kit/Bits.tsx";

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
        state: {
          etsy: {
            outcome: data.reconnected ? "reconnected" : "connected",
            organizationId: data.shop.organization_id,
          },
        },
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
      <PageHeader title={<Trans>Connecting Etsy</Trans>} />
      <Panel className="grow motion-safe:animate-enter">
        <PanelHeader
          title={
            <>
              <span className="ltr">Etsy</span> · <Trans>Connection</Trans>
            </>
          }
        />
        <div className="flex grow flex-col items-center justify-center gap-6 px-6 pb-10 text-center">
          <img
            src={parcel}
            alt=""
            draggable={false}
            className={cx(
              "h-44 w-auto object-contain max-sm:h-28",
              outcome === null
                ? "motion-safe:animate-[htco-float_3s_ease-in-out_infinite]"
                : "opacity-70 grayscale",
            )}
          />
          {outcome === null ? (
            <div role="status" className="flex flex-col items-center gap-3">
              <IdBlock label={<Trans>Etsy:</Trans>} id={<Trans>Connecting your Etsy shop</Trans>} />
              <p className="m-0 text-body-sm text-secondary">
                <Trans>This takes a few seconds. Keep this page open.</Trans>
              </p>
              <span aria-hidden="true" className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <i
                    key={i}
                    style={{ animationDelay: `${String(i * 200)}ms` }}
                    className="size-2 rounded-pill bg-inverse motion-safe:animate-[htco-wait-dot_1.2s_infinite]"
                  />
                ))}
              </span>
            </div>
          ) : (
            <Failure outcome={outcome} />
          )}
        </div>
      </Panel>
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
    <div role="alert" className="flex max-w-[480px] flex-col items-center gap-3">
      <IdBlock
        label={<Trans>Etsy:</Trans>}
        id={
          outcome.kind === "cancelled" ? (
            <Trans>Connection cancelled</Trans>
          ) : (
            <Trans>The shop was not connected</Trans>
          )
        }
        wrap
      />
      <p className="m-0 text-body-sm text-secondary">{reason()}</p>
      <Link
        to="/shops"
        className="mt-2 inline-flex h-10 items-center rounded-button bg-action-primary px-5 text-body-sm text-action-primary-fg no-underline transition-colors hover:bg-action-primary-hover active:scale-[0.98]"
      >
        <Trans>Back to shops</Trans>
      </Link>
    </div>
  );
}

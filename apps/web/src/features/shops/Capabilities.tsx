import { Trans, useLingui } from "@lingui/react/macro";
import { useId } from "react";

import type { CapabilityView, IntegrationView } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { StatusGlyph, type AgentStatus } from "../../shared/ui/kit/index.ts";
import { FormAlert } from "../../shared/ui/FormAlert.tsx";
import { ago } from "../../shared/lib/time.ts";

/** The state's glyph: the shape carries it (filled, square, dashed ring), not only the colour. */
const STATE_GLYPH: Record<CapabilityView["state"], AgentStatus> = {
  available: "running",
  unavailable: "blocked",
  unknown: "queued",
};

/** What the owner sees after pressing "Re-check": done (at a time), or why not. */
export type RecheckFeedback = { tone: "done"; at: number } | { tone: "error"; message: string };

/** "Checked just now." shows this long after the check, then the check age says the rest. */
const DONE_SHOWN_MS = 10_000;

export interface Recheck {
  onPress: () => void;
  pending: boolean;
  feedback: RecheckFeedback | undefined;
}

/**
 * What HTCO can do with the shop (slice 4.5), in plain words: each capability the read-only
 * probes checked, whether it works, and for anything blocked or not known, what happens instead
 * (AC-4.6.1). "Available" is shown only when the server's probe proved it (AC-4.5.1).
 */
export function Capabilities({
  shopName,
  integration,
  now,
  recheck,
}: {
  shopName: string;
  integration: IntegrationView;
  now: number;
  /** Owners and Admins: check again now. */
  recheck: Recheck | undefined;
}) {
  const { t } = useLingui();
  const { locale } = useLocale();
  const titleId = useId();
  const capabilities = integration.capabilities ?? [];

  const label: Record<CapabilityView["capability"], string> = {
    granted_scopes: t`Approved access`,
    shop_details: t`Shop details`,
    receipts_read: t`Orders`,
    buyer_address: t`Buyer addresses`,
    listings_read: t`Listings`,
    webhooks: t`Instant order alerts`,
    shipment_write: t`Tracking upload`,
  };
  const stateLabel: Record<CapabilityView["state"], string> = {
    available: t`Works`,
    unavailable: t`Blocked`,
    unknown: t`Not known`,
  };

  /** For anything that does not work: why, and what happens instead. */
  function explanation(item: CapabilityView): string | undefined {
    if (item.capability === "shipment_write")
      return t`HTCO never writes to your shop. AutoVA uploads tracking to Etsy; HTCO reads it there.`;
    if (item.state === "available") return undefined;
    switch (`${item.capability}:${item.detail}`) {
      case "buyer_address:address_fields_hidden":
        return t`Etsy hides buyer addresses for this shop. Your fulfillment partner gets them from Etsy; HTCO does not need them.`;
      case "buyer_address:no_receipts_yet":
        return t`Checked again once the shop has its first order.`;
      case "webhooks:not_configured":
        return t`Not set up yet. HTCO checks Etsy for new orders regularly instead.`;
      case "webhooks:configured_not_verified":
        return t`Set up. Confirmed when the first alert arrives; until then HTCO checks Etsy regularly.`;
      default:
        break;
    }
    switch (item.detail) {
      case "scope_missing":
        return t`You did not approve this on Etsy. Reconnect the shop and approve it.`;
      case "refused_by_etsy":
        return t`Etsy refused this. Reconnect the shop; if it stays blocked, Etsy has limited the app.`;
      case "auth_failed":
        return t`Etsy did not accept the connection. Reconnect the shop.`;
      case "rate_limited":
        return t`Etsy asked HTCO to slow down. Re-check in a few minutes.`;
      default:
        return t`Could not be checked this time. Re-check later.`;
    }
  }

  const checkedAt = capabilities.reduce<string | undefined>(
    (latest, item) =>
      latest === undefined || Date.parse(item.checked_at) > Date.parse(latest)
        ? item.checked_at
        : latest,
    undefined,
  );

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={titleId} className="m-0 text-caption font-light text-muted">
          <Trans>What HTCO can do</Trans>
        </h3>
        <span className="flex items-center gap-2">
          {checkedAt === undefined ? null : (
            <time className="text-caption text-muted" dateTime={checkedAt}>
              {t`Checked ${ago(checkedAt, now, locale)}`}
            </time>
          )}
          {recheck === undefined ? null : (
            <Button
              size="sm"
              aria-label={t`Re-check what HTCO can do with ${shopName}`}
              isPending={recheck.pending}
              onPress={recheck.onPress}
            >
              <Trans>Re-check</Trans>
            </Button>
          )}
        </span>
      </div>
      {capabilities.length === 0 ? (
        <p className="m-0 text-body-sm text-muted">
          <Trans>Not checked yet.</Trans>
        </p>
      ) : (
        <ul aria-labelledby={titleId} className="m-0 flex list-none flex-col p-0">
          {capabilities.map((item) => {
            const why = explanation(item);
            return (
              <li
                key={item.capability}
                className="flex flex-col gap-0.5 border-t border-line py-2 first:border-t-0"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-body-sm" data-capability="">
                    {label[item.capability]}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2 text-caption">
                    <StatusGlyph status={STATE_GLYPH[item.state]} />
                    <span>{stateLabel[item.state]}</span>
                  </span>
                </span>
                {why === undefined ? null : (
                  <span className="text-caption font-light text-secondary">{why}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {recheck?.pending === true ? (
        // Probing: the server's read-only checks are running on Etsy (AC-4.6.2's probing state).
        <p role="status" className="m-0 text-caption text-secondary">
          <Trans>Checking with Etsy now…</Trans>
        </p>
      ) : recheck?.feedback === undefined ? null : recheck.feedback.tone === "done" ? (
        now - recheck.feedback.at > DONE_SHOWN_MS ? null : (
          <p role="status" className="m-0 text-caption text-secondary">
            <Trans>Checked just now.</Trans>
          </p>
        )
      ) : (
        <FormAlert message={recheck.feedback.message} />
      )}
    </section>
  );
}

import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogTrigger, Heading, Popover } from "react-aria-components";

import { CIRCLE } from "./Sidebar.tsx";
import { inboxQuery, markRead, type Notification } from "../../features/incidents/api.ts";
import { useIncidentWords } from "../../features/incidents/IncidentState.tsx";
import { ago, useNow } from "../../shared/lib/time.ts";
import { meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { Button as TextButton } from "../../shared/ui/Button.tsx";
import { BellIcon } from "../../shared/ui/icons.tsx";

/** The panel shows the newest few: it never scrolls inside itself. */
const SHOWN = 6;

export interface Notice extends Notification {
  organizationId: string;
}

/** Every workspace's notifications, newest first, and how many are unread in all. */
function useInbox() {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const organizations = me.data?.memberships.map((m) => m.organization_id) ?? [];
  return useQueries({
    queries: organizations.map((organizationId) => inboxQuery(api, organizationId)),
    combine: (results) => {
      const items: Notice[] = results
        .flatMap((result, index) =>
          (result.data?.items ?? []).map((n) => ({
            ...n,
            organizationId: organizations[index] ?? "",
          })),
        )
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return {
        items,
        unread: results.reduce((sum, result) => sum + (result.data?.unread_count ?? 0), 0),
        organizations,
        pending: organizations.length === 0 || results.some((result) => result.isPending),
        isError: results.some((result) => result.isError) && results.every((r) => !r.data),
        // Some workspaces answered and some did not: the panel says so instead of leaving
        // them out silently (review of #48).
        partial: results.some((result) => result.isError) && results.some((r) => r.data),
        refetch: () => {
          for (const result of results) void result.refetch();
        },
      };
    },
  });
}

/** The shops' names, to say which shop a notification is about. */
function useShopNames(
  organizations: readonly string[],
): (id: string | null | undefined) => string | undefined {
  const api = useApi();
  const names = useQueries({
    queries: organizations.map((organizationId) => shopsQuery(api, organizationId)),
    combine: (results) =>
      new Map(results.flatMap((result) => (result.data ?? []).map((s) => [s.id, s.name] as const))),
  });
  return (id) => (id === null || id === undefined ? undefined : names.get(id));
}

/** A notification in words, from its kind and its parameters (never free text from the server). */
export function useNoticeText(shopName: (id: string | null | undefined) => string | undefined) {
  const { t } = useLingui();
  const words = useIncidentWords();
  const { locale } = useLocale();
  return (notice: Notification): string => {
    const p = notice.params;
    const receipt = p["receipt_id"];
    const shop = shopName(p["shop_id"] ?? notice.shop_id);
    const cause = words.cause(p["cause"] ?? "");
    switch (notice.kind) {
      case "incident_opened":
        return receipt === undefined
          ? t`New incident: ${cause}`
          : t`New incident: ${cause}, order #${receipt}`;
      case "incident_resolved":
        return receipt === undefined
          ? t`Incident resolved: ${cause}`
          : t`Incident resolved: ${cause}, order #${receipt}`;
      case "alert_ship_by": {
        const date = p["ship_by"];
        const by =
          date === undefined
            ? ""
            : new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              }).format(new Date(`${date}T00:00:00Z`));
        return t`Order #${receipt ?? ""} must ship by ${by}`;
      }
      case "alert_low_review": {
        const rating = p["rating"] ?? "";
        return t`A ${rating}-star review arrived`;
      }
      case "alert_out_of_stock": {
        const listing = p["listing_id"] ?? "";
        return t`Listing ${listing} is out of stock`;
      }
      case "relay_tracking_needed":
        return t`Order #${receipt ?? ""} needs its tracking copied to Etsy`;
      case "sign_in_new_device": {
        const device = p["device"];
        return device === undefined ? t`New sign-in on a new device` : t`New sign-in on ${device}`;
      }
      case "mfa_changed":
        return p["change"] === "removed"
          ? t`A second factor was removed`
          : t`Two-step sign-in was set up`;
      case "shop_connected":
        return shop === undefined ? t`A shop was connected` : t`${shop} was connected`;
      case "shop_disconnected":
        return shop === undefined ? t`A shop was disconnected` : t`${shop} was disconnected`;
      case "integration_reauth":
        return shop === undefined
          ? t`A shop needs reconnecting to Etsy`
          : t`${shop} needs reconnecting to Etsy`;
      case "refresh_token_expiring":
        return shop === undefined
          ? t`A shop's Etsy connection expires soon`
          : t`${shop}'s Etsy connection expires soon`;
      default:
        return t`A new notification`;
    }
  };
}

type Target =
  | {
      to: "/incidents/{-$incidentId}";
      params: { incidentId: string };
      search: { workspace: string };
    }
  | {
      // A shop's alert opens on that shop (`?shop=`), not on the first one (Codex review of #48).
      to: "/commerce/shipping" | "/commerce/products" | "/customers/customers";
      search: { shop?: string };
    }
  | { to: "/shops" | "/settings/security" };

/** Where a notification leads: its incident, or the screen its subject lives on. */
function targetOf(notice: Notice): Target | undefined {
  const params: Partial<Record<string, string>> = notice.params;
  const incident = notice.incident_id ?? params["incident_id"];
  if (incident !== undefined)
    return {
      to: "/incidents/{-$incidentId}",
      params: { incidentId: incident },
      search: { workspace: notice.organizationId },
    };
  const shop = notice.shop_id === null ? {} : { shop: notice.shop_id };
  switch (notice.kind) {
    case "alert_ship_by":
    case "relay_tracking_needed":
      return { to: "/commerce/shipping", search: shop };
    case "alert_out_of_stock":
      return { to: "/commerce/products", search: shop };
    case "alert_low_review":
      return { to: "/customers/customers", search: shop };
    case "sign_in_new_device":
    case "mfa_changed":
      return { to: "/settings/security" };
    case "shop_connected":
    case "shop_disconnected":
    case "integration_reauth":
    case "refresh_token_expiring":
      return { to: "/shops" };
    default:
      return undefined;
  }
}

/**
 * The notification bell in the top bar (platform slice 6.5): the unread count on the bell, and a
 * panel with the newest notifications in the user's language, "Mark all read", and each one
 * leading to what it is about (an incident opens itself). New notifications that arrive while the
 * app is open are announced in a polite live region, never an assertive one (AC-6.5.2).
 */
export function NotificationBell({ className }: { className?: string }) {
  const { t } = useLingui();
  const api = useApi();
  const client = useQueryClient();
  const inbox = useInbox();
  const shopName = useShopNames(inbox.organizations);
  const text = useNoticeText(shopName);
  const { locale } = useLocale();
  const now = useNow(60_000);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLElement>(null);
  const announcement = useAnnouncement(inbox.items, inbox.pending, text);

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["incidents"] });
  };
  // The unread ones first, newest first, then the read ones: once the shown six are marked read,
  // the older unread ones come into view, so every unread one can be read and marked without
  // marking one nobody saw (Codex review of #48).
  const shown = [
    ...inbox.items.filter((notice) => notice.read_at === null),
    ...inbox.items.filter((notice) => notice.read_at !== null),
  ].slice(0, SHOWN);
  const shownUnread = shown.filter((notice) => notice.read_at === null);
  // Only what the panel shows is marked: never one that arrived after it rendered, nor one
  // beyond the newest six (review of #48).
  const readAll = useMutation({
    mutationFn: (notices: readonly Notice[]) => {
      const byWorkspace = new Map<string, string[]>();
      for (const notice of notices)
        byWorkspace.set(notice.organizationId, [
          ...(byWorkspace.get(notice.organizationId) ?? []),
          notice.id,
        ]);
      return Promise.all(
        [...byWorkspace].map(([organizationId, ids]) => markRead(api, organizationId, ids)),
      );
    },
    onSettled: () => {
      refresh();
      // "Mark all read" leaves with the unread ones: focus stays in the panel, not on the page.
      dialog.current?.focus();
    },
  });
  const readOne = useMutation({
    mutationFn: (notice: Notice) => markRead(api, notice.organizationId, [notice.id]),
    onSettled: refresh,
  });

  const name = inbox.unread > 0 ? t`Notifications, ${inbox.unread} unread` : t`Notifications`;
  const allShown = inbox.unread <= shownUnread.length;

  return (
    <>
      <DialogTrigger isOpen={open} onOpenChange={setOpen}>
        <Button
          aria-label={name}
          className={cx(
            CIRCLE,
            "relative cursor-default border-line-strong text-primary outline-none data-[hovered]:border-line-hover data-[pressed]:scale-95",
            "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus",
            className,
          )}
        >
          <BellIcon />
          {inbox.unread > 0 ? (
            <span
              aria-hidden="true"
              className="ltr absolute -top-1 -inset-e-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill border-2 border-ground bg-tertiary px-1 text-caption leading-none font-medium text-on-tertiary tabular"
            >
              {inbox.unread > 99 ? "99+" : inbox.unread}
            </span>
          ) : null}
        </Button>
        <Popover
          placement="bottom end"
          offset={8}
          className="w-[min(380px,calc(100vw-24px))] rounded-card border border-line bg-menu text-primary shadow-popover outline-none backdrop-blur-[22px] data-[entering]:animate-pop-in"
        >
          <Dialog ref={dialog} aria-label={t`Notifications`} className="flex flex-col outline-none">
            <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
              <Heading slot="title" className="m-0 text-body-sm font-normal">
                <Trans>Notifications</Trans>
              </Heading>
              {shownUnread.length > 0 ? (
                <TextButton
                  variant="ghost"
                  size="sm"
                  isPending={readAll.isPending}
                  onPress={() => {
                    readAll.mutate(shownUnread);
                  }}
                >
                  {allShown ? <Trans>Mark all read</Trans> : <Trans>Mark these read</Trans>}
                </TextButton>
              ) : null}
            </div>
            {readAll.isError ? (
              <p role="alert" className="m-0 px-4 pb-2 text-caption text-secondary">
                <Trans>They could not be marked read. Try again.</Trans>
              </p>
            ) : null}
            {inbox.partial ? (
              <div
                role="status"
                className="flex items-center justify-between gap-3 px-4 pb-2 text-caption text-secondary"
              >
                <span>
                  <Trans>Some workspaces' notifications did not load</Trans>
                </span>
                <TextButton variant="ghost" size="sm" onPress={inbox.refetch}>
                  <Trans>Try again</Trans>
                </TextButton>
              </div>
            ) : null}
            {inbox.isError ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-3 px-4 pt-2 pb-5 text-center"
              >
                <p className="m-0 text-body-sm text-secondary">
                  <Trans>Notifications could not be loaded</Trans>
                </p>
                <TextButton size="sm" onPress={inbox.refetch}>
                  <Trans>Try again</Trans>
                </TextButton>
              </div>
            ) : inbox.pending ? (
              <p aria-busy="true" className="m-0 px-4 pt-1 pb-5 text-body-sm text-muted">
                <Trans>Loading notifications…</Trans>
              </p>
            ) : shown.length === 0 ? (
              <div className="flex flex-col gap-1 px-4 pt-1 pb-5">
                <p className="m-0 text-body-sm">
                  <Trans>No notifications yet</Trans>
                </p>
                <p className="m-0 text-caption text-secondary">
                  <Trans>
                    Incidents, shipping alerts and sign-ins on a new device appear here.
                  </Trans>
                </p>
              </div>
            ) : (
              <>
                <ul className="m-0 flex list-none flex-col p-1.5 pt-0">
                  {shown.map((notice) => {
                    const target = targetOf(notice);
                    const unread = notice.read_at === null;
                    const body = (
                      <>
                        <span
                          aria-hidden="true"
                          className={cx(
                            "mt-1.5 size-2 shrink-0 rounded-pill",
                            unread ? "bg-tertiary" : "bg-transparent",
                          )}
                        />
                        <span className="flex min-w-0 grow flex-col gap-0.5">
                          <span
                            data-text=""
                            className={cx("text-body-sm text-pretty", unread && "font-medium")}
                          >
                            {text(notice)}
                          </span>
                          <span className="text-caption text-muted">
                            {unread ? (
                              <>
                                <span className="text-tertiary-text">
                                  <Trans>Unread</Trans>
                                </span>
                                <span aria-hidden="true"> · </span>
                                <span className="sr-only">, </span>
                              </>
                            ) : null}
                            {ago(notice.created_at, now, locale)}
                          </span>
                        </span>
                      </>
                    );
                    const row =
                      "flex items-start gap-2.5 rounded-menu-item px-2.5 py-2.5 text-start text-primary no-underline outline-none";
                    return (
                      <li key={notice.id}>
                        {target === undefined ? (
                          <div className={row}>{body}</div>
                        ) : (
                          <Link
                            {...target}
                            onClick={() => {
                              setOpen(false);
                              if (unread) readOne.mutate(notice);
                            }}
                            className={cx(
                              row,
                              "transition-colors duration-[var(--motion-duration-fast)] hover:bg-hover focus-visible:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
                            )}
                          >
                            {body}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {inbox.items.length > SHOWN ? (
                  <p className="m-0 border-t border-line px-4 py-2.5 text-caption text-muted">
                    <Trans>
                      The newest {SHOWN} of {inbox.items.length}
                    </Trans>
                  </p>
                ) : null}
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
      {/* New notifications are said once, politely, without moving focus (AC-6.5.2). */}
      <span aria-live="polite" data-announcer="notifications" className="sr-only">
        {announcement}
      </span>
    </>
  );
}

/**
 * What to announce: the notifications that arrived since the inbox was first read. What was
 * already there when the app opened is never announced.
 */
function useAnnouncement(
  items: readonly Notice[],
  pending: boolean,
  text: (notice: Notification) => string,
): string {
  const { t } = useLingui();
  const known = useRef<Set<string> | null>(null);
  const [message, setMessage] = useState("");
  const ids = items.map((n) => n.id).join(",");
  useEffect(() => {
    if (pending) return;
    if (known.current === null) {
      known.current = new Set(items.map((n) => n.id));
      return;
    }
    const seen = known.current;
    const fresh = items.filter((n) => !seen.has(n.id) && n.read_at === null);
    for (const n of items) seen.add(n.id);
    if (fresh.length === 0) return;
    const [first] = fresh;
    setMessage(
      fresh.length === 1 && first !== undefined
        ? t`1 new notification: ${text(first)}`
        : t`${fresh.length} new notifications`,
    );
    // `ids` stands for the items; `text` and `t` follow the language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, pending]);
  return message;
}

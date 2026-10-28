import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useId, useState, type SyntheticEvent } from "react";

import {
  CARRIERS,
  carrierName,
  pasteTracking,
  relayItemsQuery,
  relayKeys,
  revealCode,
  type Carrier,
  type RelayItem,
  type RelayPaste,
} from "./relay.ts";
import { ApiError, forgetSession, meQuery, shopsQuery, useApi } from "../../shared/api/api.tsx";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { cx } from "../../shared/lib/cx.ts";
import { useNow } from "../../shared/lib/time.ts";
import { Button, buttonStyle } from "../../shared/ui/Button.tsx";
import { FormAlert } from "../../shared/ui/FormAlert.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import { WorkspacePicker, pickWorkspace } from "../../shared/ui/WorkspacePicker.tsx";
import {
  Aside,
  CheckGlyph,
  ChoiceChips,
  CopyGlyph,
  DataTable,
  EyeGlyph,
  Figure,
  Figures,
  Flow,
  FlowBody,
  FlowRow,
  Focus,
  KV,
  LockGlyph,
  N,
  Note,
  PillField,
  SectionLabel,
  SubTabs,
  TabPanel,
} from "../../shared/ui/kit/index.ts";

/**
 * Commerce › Tracking, the AutoVA tracking relay (platform slice 6.10). The owner orders from
 * suppliers through AutoVA, which has no API: for every paid order still without tracking he
 * copies the number from AutoVA, pastes it here, the server checks it (carrier and format), and
 * then he copies it into Etsy. The order closes on its own once Etsy shows the tracking.
 *
 * Two sub-tabs: orders that need a number (paste → check → state) and orders whose number is
 * ready for Etsy (reveal → copy). The number comes only from the audited reveal, only when he
 * asks, and is kept in this view's state alone: never cached, stored, logged or put in an address.
 */
export function RelayPage() {
  const api = useApi();
  const me = useQuery(meQuery(api));
  const ids = (me.data?.memberships ?? []).map((m) => m.organization_id);
  const search: { workspace?: string } = useSearch({ strict: false });
  const navigate = useNavigate();
  const organizationId = pickWorkspace(ids, search.workspace ?? null);
  return (
    <>
      <PageHeader title={<Trans context="navigation">Tracking</Trans>} />
      <Flow>
        {ids.length > 1 ? (
          <div className="shrink-0 motion-safe:animate-enter">
            <WorkspacePicker
              ids={ids}
              value={organizationId ?? null}
              onChange={(id) => {
                void navigate({ to: "/commerce/tracking", search: { workspace: id } });
              }}
            />
          </div>
        ) : null}
        {organizationId === undefined ? null : (
          <Relay key={organizationId} organizationId={organizationId} />
        )}
      </Flow>
    </>
  );
}

type Tab = "paste" | "copy";

const HOUR = 3_600_000;

/** "3 d", "5 h": how long an order has waited, in the largest whole unit. */
function useAge(): (iso: string, now: number) => string {
  const { t } = useLingui();
  return (iso, now) => {
    const ms = Math.max(0, now - Date.parse(iso));
    if (ms >= 24 * HOUR) {
      const days = Math.floor(ms / (24 * HOUR));
      return t({ message: `${String(days)} d`, context: "age in days" });
    }
    const hours = Math.max(1, Math.floor(ms / HOUR));
    return t({ message: `${String(hours)} h`, context: "age in hours" });
  };
}

function useDate(): (iso: string) => string {
  const { locale } = useLocale();
  return (iso) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
}

/** What the last paste did, said at the top of the screen until the next one. */
type Outcome =
  | { kind: "handed_off"; item: RelayPaste }
  | { kind: "on_etsy"; item: RelayPaste }
  | { kind: "moved" };

function Relay({ organizationId }: { organizationId: string }) {
  const { t } = useLingui();
  const api = useApi();
  const tabs = useId();
  const [tab, setTab] = useState<Tab>("paste");
  const [chosen, setChosen] = useState<Record<Tab, string | undefined>>({
    paste: undefined,
    copy: undefined,
  });
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const list = useQuery(relayItemsQuery(api, organizationId));
  const shops = useQuery(shopsQuery(api, organizationId));
  const shopName = (id: string) => shops.data?.find((shop) => shop.id === id)?.name ?? "–";
  const now = useNow(60_000);
  const age = useAge();

  if (list.isError) return <ListProblem error={list.error} onRetry={() => void list.refetch()} />;

  const items = list.data?.items ?? [];
  const more = list.data?.more === true;
  const waiting = items.filter((item) => item.state === "awaiting_tracking");
  const ready = items.filter((item) => item.state === "handed_off");
  const shown = tab === "paste" ? waiting : ready;
  // The chosen order of this tab, or its first: there is always one to act on.
  const selected = shown.find((item) => item.id === chosen[tab]) ?? shown[0];
  const oldest = waiting[0]?.paid_at;

  const choose = (next: Tab, id?: string) => {
    setTab(next);
    if (id !== undefined) setChosen((previous) => ({ ...previous, [next]: id }));
  };

  return (
    <>
      <Focus
        title={
          list.isPending ? (
            <Trans>Tracking from AutoVA</Trans>
          ) : waiting.length === 0 ? (
            <Trans>No order is waiting for tracking</Trans>
          ) : more ? (
            <Trans>More than {waiting.length} orders need a tracking number</Trans>
          ) : (
            <Plural
              value={waiting.length}
              one="# order needs a tracking number"
              other="# orders need a tracking number"
            />
          )
        }
        lead={
          <Trans>
            Copy the number from the order in AutoVA and paste it here: HTCO checks it before
            anything is saved. Then copy it into Etsy. The order closes on its own once Etsy shows
            the tracking.
          </Trans>
        }
        figures={
          list.isPending ? (
            <Skeleton label={t`Loading the orders…`} />
          ) : (
            <Figures label={t`Key figures`}>
              <Figure
                label={<Trans>Need a number</Trans>}
                value={
                  <N>
                    {waiting.length}
                    {more ? "+" : ""}
                  </N>
                }
                tone={waiting.length > 0 ? "tertiary" : undefined}
              />
              <Figure label={<Trans>Ready for Etsy</Trans>} value={<N>{ready.length}</N>} />
              <Figure
                label={<Trans>Oldest waiting</Trans>}
                value={oldest === undefined ? "–" : age(oldest, now)}
              />
            </Figures>
          )
        }
        aside={<HowItWorks />}
      />
      {outcome === null ? null : (
        <OutcomeNote
          outcome={outcome}
          onCopy={(id) => {
            setOutcome(null);
            choose("copy", id);
          }}
          onDismiss={() => {
            setOutcome(null);
          }}
        />
      )}
      <SubTabs
        label={t`Tracking`}
        idBase={tabs}
        value={tab}
        onChange={(next) => {
          choose(next);
        }}
        tabs={[
          { id: "paste", label: <Trans>Need a number</Trans>, count: list.data && waiting.length },
          { id: "copy", label: <Trans>Copy into Etsy</Trans>, count: list.data && ready.length },
        ]}
      />
      <TabPanel idBase={tabs} tab={tab}>
        <FlowRow layout="main-side">
          {list.isPending ? (
            <Panel>
              <Skeleton rows={3} />
            </Panel>
          ) : shown.length === 0 ? (
            <EmptyTab tab={tab} />
          ) : (
            <Panel>
              <PanelHeader
                title={tab === "paste" ? t`Orders without tracking` : t`Numbers ready for Etsy`}
                meta={<Trans>Oldest first</Trans>}
              />
              <DataTable
                flow
                label={tab === "paste" ? t`Orders without tracking` : t`Numbers ready for Etsy`}
                head={[t`Order`, t`Shop`, t`Paid`, t`Waiting`]}
                ends={[3]}
                phoneHidden={[2]}
                rows={shown.map((item) => ({
                  key: item.id,
                  selected: item.id === selected?.id,
                  onSelect: () => {
                    choose(tab, item.id);
                  },
                  cells: [
                    <N key="order" className="font-mono">
                      #{item.receipt_id}
                    </N>,
                    <span key="shop" className="block max-w-[200px] truncate">
                      {shopName(item.shop_id)}
                    </span>,
                    <PaidOn key="paid" iso={item.paid_at} />,
                    <span key="age" className="tabular">
                      {age(item.paid_at, now)}
                    </span>,
                  ],
                }))}
              />
            </Panel>
          )}
          <Aside>
            {selected === undefined ? null : tab === "paste" ? (
              <PastePanel
                key={selected.id}
                organizationId={organizationId}
                item={selected}
                shop={shopName(selected.shop_id)}
                onDone={setOutcome}
              />
            ) : (
              <CopyPanel
                key={selected.id}
                organizationId={organizationId}
                item={selected}
                shop={shopName(selected.shop_id)}
              />
            )}
          </Aside>
        </FlowRow>
      </TabPanel>
    </>
  );
}

function PaidOn({ iso }: { iso: string }) {
  const date = useDate();
  return <span className="whitespace-nowrap">{date(iso)}</span>;
}

/** The three steps, at the focus's end on wide screens: what to do, in order. */
function HowItWorks() {
  const { t } = useLingui();
  const steps = [t`Copy the number in AutoVA`, t`Paste it here to check it`, t`Copy it into Etsy`];
  return (
    <ol aria-label={t`How it works`} className="m-0 flex w-60 list-none flex-col gap-3 p-0">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-3 text-body-sm">
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-pill border border-line-strong text-caption tabular"
          >
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

function Skeleton({ label, rows = 1 }: { label?: string; rows?: number }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-3 p-6 max-sm:p-4">
      {label === undefined ? null : <span className="text-caption text-muted">{label}</span>}
      {Array.from({ length: rows }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="h-9 rounded-pill bg-hover motion-safe:animate-pulse"
          style={{ width: `${String(100 - ((i * 13) % 35))}%` }}
        />
      ))}
    </div>
  );
}

/** The list could not be read: no role, not set up on this server, or not answering. */
function ListProblem({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const refused = error instanceof ApiError && error.status === 403;
  const off = error instanceof ApiError && error.type === "relay-unavailable";
  return (
    <Panel>
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
      >
        <h2 className="m-0 font-display text-title-sm font-light">
          <Trans>The orders waiting for tracking could not be loaded</Trans>
        </h2>
        <p className="m-0 max-w-[46ch] text-body-sm text-secondary">
          {refused ? (
            <Trans>Your role does not include fulfillment. Ask an Owner or Admin.</Trans>
          ) : off ? (
            <Trans>The tracking relay is not set up on this server yet.</Trans>
          ) : (
            <Trans>The server is not answering. Check your connection and try again.</Trans>
          )}
        </p>
        {refused ? null : (
          <Button variant="primary" size="lg" onPress={onRetry}>
            <Trans>Try again</Trans>
          </Button>
        )}
      </div>
    </Panel>
  );
}

function EmptyTab({ tab }: { tab: Tab }) {
  return (
    <Panel>
      <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
        <span aria-hidden="true" className="mb-1 text-success-text">
          <CheckGlyph size={22} />
        </span>
        <h3 className="m-0 font-display text-title-sm font-light">
          {tab === "paste" ? (
            <Trans>Every order has its tracking number</Trans>
          ) : (
            <Trans>Nothing to copy into Etsy</Trans>
          )}
        </h3>
        <p className="m-0 max-w-[46ch] text-body-sm text-pretty text-secondary">
          {tab === "paste" ? (
            <Trans>
              A paid order shows here when it still has no tracking two business days after payment.
            </Trans>
          ) : (
            <Trans>A number shows here once it is pasted and checked, until Etsy shows it.</Trans>
          )}
        </p>
      </div>
    </Panel>
  );
}

/** The last paste's result, in words, with the next step. */
function OutcomeNote({
  outcome,
  onCopy,
  onDismiss,
}: {
  outcome: Outcome;
  onCopy: (id: string) => void;
  onDismiss: () => void;
}) {
  return (
    <Panel className="motion-safe:animate-enter">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 max-sm:px-4">
        <p role="status" className="m-0 inline-flex items-center gap-2.5 text-body-sm">
          <span aria-hidden="true" className="text-success-text">
            <CheckGlyph size={16} />
          </span>
          {outcome.kind === "handed_off" ? (
            <Trans>
              Checked and saved: {carrierName(outcome.item.carrier ?? "")} number ending in{" "}
              <N className="font-mono">{outcome.item.last4 ?? ""}</N> for order{" "}
              <N className="font-mono">#{outcome.item.receipt_id}</N>. Now copy it into Etsy.
            </Trans>
          ) : outcome.kind === "on_etsy" ? (
            <Trans>
              Etsy already shows this number for order{" "}
              <N className="font-mono">#{outcome.item.receipt_id}</N>, so the order is done. Nothing
              to copy.
            </Trans>
          ) : (
            <Trans>This order is no longer waiting for a number. The list is up to date.</Trans>
          )}
        </p>
        <div className="flex gap-2">
          {outcome.kind === "handed_off" ? (
            <Button
              variant="primary"
              onPress={() => {
                onCopy(outcome.item.id);
              }}
            >
              <Trans>Copy into Etsy</Trans>
            </Button>
          ) : null}
          <Button variant="ghost" onPress={onDismiss}>
            <Trans>Dismiss</Trans>
          </Button>
        </div>
      </div>
    </Panel>
  );
}

/** The heading and facts every order's panel starts with. */
function OrderHead({
  headingId,
  item,
  shop,
}: {
  headingId: string;
  item: RelayItem;
  shop: string;
}) {
  const date = useDate();
  return (
    <div className="flex flex-col gap-4">
      <h2 id={headingId} className="m-0 font-display text-title-sm font-light">
        <Trans>
          Order <N className="font-mono">#{item.receipt_id}</N>
        </Trans>
      </h2>
      <KV
        items={[
          [<Trans key="l">Shop</Trans>, shop],
          [<Trans key="l">Paid</Trans>, date(item.paid_at)],
        ]}
      />
    </div>
  );
}

/**
 * A paste or reveal answered 401: the session ended (expired, signed out elsewhere), so trying
 * again here cannot work. Like the query cache's handler in `App.tsx`, forget the session and go
 * back to sign-in. True when it did.
 */
function useSessionEnded(): (error: unknown) => boolean {
  const client = useQueryClient();
  const navigate = useNavigate();
  return (error) => {
    if (!(error instanceof ApiError && error.status === 401)) return false;
    forgetSession(client);
    void navigate({ to: "/sign-in" });
    return true;
  };
}

/** The words for a refused paste or reveal, and whether the second factor is the way out. */
function useProblem(): (error: unknown, carrier: Carrier | null) => { text: string; mfa: boolean } {
  const { t } = useLingui();
  return (error, carrier) => {
    const type = error instanceof ApiError ? error.type : undefined;
    const status = error instanceof ApiError ? error.status : undefined;
    const name = carrier === null ? "" : carrierName(carrier);
    switch (type) {
      case "mfa-required":
        return {
          text: t`This needs your second factor. Confirm it with your authenticator app, then try again.`,
          mfa: true,
        };
      case "forbidden":
        return {
          text: t`Only an Owner or Admin can paste or copy tracking numbers. Ask one of them.`,
          mfa: false,
        };
      case "tracking-invalid":
        return {
          text:
            name === ""
              ? t`This is not a valid tracking number. Check it in AutoVA and paste it again.`
              : t`This is not a valid ${name} tracking number. Check the number and the carrier in AutoVA, then paste it again.`,
          mfa: false,
        };
      case "tracking-already-used":
        return {
          text: t`This number is already used for another order of this shop. Check that you copied it from the right order in AutoVA.`,
          mfa: false,
        };
      case "relay-unavailable":
        return { text: t`The tracking relay is not set up on this server yet.`, mfa: false };
      default:
        break;
    }
    if (status === 404)
      return {
        text: t`This order is no longer here: it closed, or its number expired after 30 days. The list is up to date.`,
        mfa: false,
      };
    return { text: t`This did not work. Check your connection and try again.`, mfa: false };
  };
}

function ProblemAlert({ problem }: { problem: { text: string; mfa: boolean } | undefined }) {
  if (problem === undefined) return null;
  return (
    <div className="flex flex-col gap-2">
      <FormAlert message={problem.text} />
      {problem.mfa ? (
        <Link to="/security/setup" className={cx(buttonStyle({ size: "md" }), "self-start")}>
          <LockGlyph size={14} />
          <Trans>Confirm my second factor</Trans>
        </Link>
      ) : null}
    </div>
  );
}

/** Step 1 and 2: pick the carrier, paste the number, the server checks it. */
function PastePanel({
  organizationId,
  item,
  shop,
  onDone,
}: {
  organizationId: string;
  item: RelayItem;
  shop: string;
  onDone: (outcome: Outcome) => void;
}) {
  const { t } = useLingui();
  const api = useApi();
  const client = useQueryClient();
  const heading = useId();
  const problemOf = useProblem();
  const sessionEnded = useSessionEnded();
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [code, setCode] = useState("");
  const [problem, setProblem] = useState<{ text: string; mfa: boolean } | undefined>();
  const [pending, setPending] = useState(false);
  const refresh = () => client.invalidateQueries({ queryKey: relayKeys.list(organizationId) });

  // Not a mutation hook: its cache would keep the pasted number (the variables) after the view.
  async function submit(event: SyntheticEvent) {
    event.preventDefault();
    if (carrier === null || code.trim() === "" || pending) return;
    setPending(true);
    setProblem(undefined);
    try {
      const after = await pasteTracking(api, organizationId, item.id, carrier, code.trim());
      setCode("");
      onDone(
        after.state === "closed"
          ? { kind: "on_etsy", item: after }
          : { kind: "handed_off", item: after },
      );
      void refresh();
    } catch (error) {
      if (sessionEnded(error)) return;
      if (
        error instanceof ApiError &&
        (error.type === "relay-item-moved" || error.status === 404)
      ) {
        onDone({ kind: "moved" });
        void refresh();
      } else setProblem(problemOf(error, carrier));
    } finally {
      setPending(false);
    }
  }

  return (
    <Panel labelledBy={heading}>
      <FlowBody className="gap-6 pt-6">
        <OrderHead headingId={heading} item={item} shop={shop} />
        <form className="flex flex-col gap-5" onSubmit={(event) => void submit(event)} noValidate>
          <ChoiceChips
            label={t`Carrier, as AutoVA shows it`}
            value={carrier}
            onChange={setCarrier}
            options={CARRIERS.map((id) => ({ id, label: carrierName(id) }))}
            isDisabled={pending}
          />
          <PillField
            label={t`Tracking number`}
            ltr
            mono
            value={code}
            onChange={(next) => {
              setCode(next);
              setProblem(undefined);
            }}
            isInvalid={problem !== undefined && !problem.mfa}
            isDisabled={pending}
            maxLength={60}
            autoComplete="off"
            spellCheck="false"
          />
          <ProblemAlert problem={problem} />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isPending={pending}
            isDisabled={carrier === null || code.trim() === ""}
          >
            <Trans>Check and save</Trans>
          </Button>
          <p className="m-0 text-caption text-muted">
            <Trans>
              HTCO checks the carrier and the number before saving. Nothing is sent to Etsy from
              here.
            </Trans>
          </p>
        </form>
      </FlowBody>
    </Panel>
  );
}

/** How long a revealed number stays on screen before it hides itself. */
const SHOWN_MS = 120_000;

/** Step 3: reveal the checked number when asked, copy it, paste it in Etsy. */
function CopyPanel({
  organizationId,
  item,
  shop,
}: {
  organizationId: string;
  item: RelayItem;
  shop: string;
}) {
  const { t } = useLingui();
  const api = useApi();
  const client = useQueryClient();
  const heading = useId();
  const problemOf = useProblem();
  const sessionEnded = useSessionEnded();
  // The number lives here only, and only while shown.
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<"yes" | "refused" | null>(null);
  const [problem, setProblem] = useState<{ text: string; mfa: boolean } | undefined>();
  const reveal = useMutation({
    // The answer is handed to this view's state and never returned into the mutation cache.
    mutationFn: async () => {
      setCode(await revealCode(api, organizationId, item.id));
    },
    onMutate: () => {
      setProblem(undefined);
      setCopied(null);
    },
    onError: (error) => {
      if (sessionEnded(error)) return;
      setProblem(problemOf(error, null));
      if (error instanceof ApiError && error.status === 404)
        void client.invalidateQueries({ queryKey: relayKeys.list(organizationId) });
    },
  });
  // Shown for two minutes at most, then hidden again.
  useEffect(() => {
    if (code === null) return;
    const timer = setTimeout(() => {
      setCode(null);
      setCopied(null);
    }, SHOWN_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [code]);

  async function copy() {
    if (code === null) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied("yes");
    } catch {
      setCopied("refused");
    }
  }

  return (
    <Panel labelledBy={heading}>
      <FlowBody className="gap-6 pt-6">
        <OrderHead headingId={heading} item={item} shop={shop} />
        <div className="flex flex-col gap-3">
          <SectionLabel className="mb-0">
            <Trans>Tracking number</Trans>
          </SectionLabel>
          {code === null ? (
            <div className="flex h-14 items-center gap-3 rounded-card border border-line-strong px-4 text-body-sm text-secondary">
              <LockGlyph size={16} className="shrink-0 text-muted" />
              <Trans>Hidden until you reveal it</Trans>
            </div>
          ) : (
            <div className="flex min-h-14 items-center rounded-card border border-inverse px-4 py-3">
              <span
                dir="ltr"
                aria-label={t`Tracking number`}
                className="font-mono text-body break-all select-all"
              >
                {code}
              </span>
            </div>
          )}
          {code === null ? (
            <Button
              variant="primary"
              size="lg"
              isPending={reveal.isPending}
              onPress={() => {
                reveal.mutate();
              }}
            >
              <EyeGlyph size={16} />
              <Trans>Reveal the number</Trans>
            </Button>
          ) : (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Button variant="primary" size="lg" onPress={() => void copy()}>
                <CopyGlyph size={16} />
                <Trans>Copy to clipboard</Trans>
              </Button>
              <Button
                size="lg"
                onPress={() => {
                  setCode(null);
                  setCopied(null);
                }}
              >
                <Trans>Hide</Trans>
              </Button>
            </div>
          )}
          <p role="status" className={cx("m-0 text-body-sm", copied === null && "sr-only")}>
            {copied === "yes" ? (
              <Trans>
                Copied. In Etsy, open this order and add the tracking with this carrier.
              </Trans>
            ) : copied === "refused" ? (
              <Trans>
                The browser did not allow copying. Select the number and copy it by hand.
              </Trans>
            ) : null}
          </p>
          <ProblemAlert problem={problem} />
        </div>
        <Note>
          <Trans>
            Each reveal is recorded in the audit log. The order closes on its own once Etsy shows
            the tracking.
          </Trans>
        </Note>
      </FlowBody>
    </Panel>
  );
}

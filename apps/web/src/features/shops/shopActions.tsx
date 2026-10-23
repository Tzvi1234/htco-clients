import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

import type { RecheckFeedback } from "./Capabilities.tsx";
import { StepUpDialog } from "./connectEtsy.tsx";
import { ApiError, apiError, shopKeys, useApi, type ShopView } from "../../shared/api/api.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { TextField } from "../../shared/ui/TextField.tsx";

/** The API answered 429: the shop was checked moments ago. */
class CheckedMomentsAgo extends Error {
  readonly seconds: number;

  constructor(seconds: number) {
    super("checked moments ago");
    this.seconds = seconds;
  }
}

export interface Rechecks {
  run: (shopId: string) => void;
  pendingShop: string | null;
  feedbackFor: (shopId: string) => RecheckFeedback | undefined;
}

/**
 * "Re-check" on the shop card (slice 4.5): the server probes the shop again with read-only calls
 * and the connection details reload. Owners and Admins only (the server decides).
 */
export function useRechecks(organizationId: string): Rechecks {
  const { t } = useLingui();
  const api = useApi();
  const queries = useQueryClient();
  const [last, setLast] = useState<{ shopId: string; feedback: RecheckFeedback } | null>(null);

  const recheck = useMutation({
    mutationFn: async (shopId: string) => {
      const { data, error, response } = await api.POST(
        "/v1/shop-integrations/{shop_id}/capability-checks",
        { params: { path: { shop_id: shopId } } },
      );
      if (response.status === 429)
        throw new CheckedMomentsAgo(Number(response.headers.get("retry-after") ?? "30") || 30);
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    onMutate: () => {
      setLast(null);
    },
    onSuccess: async (_, shopId) => {
      await queries.invalidateQueries({ queryKey: shopKeys.integrations(organizationId) });
      setLast({ shopId, feedback: { tone: "done", at: Date.now() } });
    },
    onError: (error, shopId) => {
      setLast({ shopId, feedback: { tone: "error", message: message(error) } });
    },
  });

  function message(error: Error): string {
    if (error instanceof CheckedMomentsAgo)
      return t`Checked moments ago. Try again in ${String(error.seconds)} seconds.`;
    if (error instanceof ApiError) {
      switch (error.type) {
        case "shop-not-connected":
          return error.reason === "disconnected"
            ? t`This shop is not connected. Reconnect it first.`
            : t`This shop needs reconnecting: Etsy no longer accepts its connection. Press Reconnect.`;
        case "forbidden":
          return t`Only the workspace owner or an admin can re-check a shop.`;
        case "etsy-unavailable":
          return t`Etsy checks are unavailable right now. Try again in a few minutes.`;
        case "not-found":
          return t`This shop is no longer here. Refresh the page.`;
        default:
          break;
      }
    }
    // A network failure (no answer at all) says so instead of nothing.
    if (!(error instanceof ApiError)) return t`HTCO could not be reached. Check your connection.`;
    return t`The check did not finish. Try again shortly.`;
  }

  return {
    run: (shopId) => {
      recheck.mutate(shopId);
    },
    pendingShop: recheck.isPending ? recheck.variables : null,
    feedbackFor: (shopId) => (last?.shopId === shopId ? last.feedback : undefined),
  };
}

export interface Disconnects {
  /** Ask the Owner to confirm disconnecting this shop. */
  ask: (shop: ShopView) => void;
  pendingShop: string | null;
  /** The shop just disconnected, for the page's confirmation. */
  done: string | undefined;
  /** Why the last attempt failed, in plain words. */
  message: string | undefined;
  /** The confirmation and code dialogs, rendered once by the page. */
  dialogs: ReactNode;
}

/**
 * Disconnecting a shop (slice 4.7): a confirmation first, then the API. It wants a fresh second
 * factor, so a code is asked for and the request sent again. The server deletes the tokens,
 * stops every Etsy call for the shop and deletes its data after 30 days unless reconnected.
 */
export function useDisconnects(organizationId: string): Disconnects {
  const { t } = useLingui();
  const api = useApi();
  const queries = useQueryClient();
  const [confirming, setConfirming] = useState<ShopView | null>(null);
  const [target, setTarget] = useState<ShopView | null>(null);
  const [askCode, setAskCode] = useState(false);
  const [done, setDone] = useState<string | undefined>(undefined);

  const disconnect = useMutation({
    mutationFn: async (shop: ShopView) => {
      const { data, error, response } = await api.POST(
        "/v1/shop-integrations/{shop_id}/disconnect",
        { params: { path: { shop_id: shop.id } } },
      );
      if (data === undefined) throw apiError(response, error);
      return data;
    },
    onMutate: () => {
      setDone(undefined);
    },
    onSuccess: async (_, shop) => {
      setTarget(null);
      // The shop's live data (orders carry buyer names) is not kept once HTCO's access is gone;
      // its screens ask again and say the shop is disconnected (post-merge review, 2026-10-23).
      queries.removeQueries({ queryKey: ["live", shop.id] });
      await queries.invalidateQueries({ queryKey: shopKeys.list(organizationId) });
      await queries.invalidateQueries({ queryKey: shopKeys.integrations(organizationId) });
      setDone(shop.name);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.type === "step-up-required") setAskCode(true);
    },
  });

  function message(): string | undefined {
    const error = disconnect.error;
    if (error === null) return undefined;
    if (error instanceof ApiError) {
      // The session ended (expired, signed out elsewhere): trying again here cannot work.
      if (error.status === 401)
        return t`Your session has ended. Sign in again, then disconnect the shop.`;
      switch (error.type) {
        case "step-up-required":
          return undefined;
        case "mfa-required":
          return t`Set up two-factor sign-in in Security first, then disconnect the shop.`;
        case "forbidden":
          return t`Only the workspace owner can disconnect a shop.`;
        case "not-found":
          return t`This shop is no longer here. Refresh the page.`;
        case "etsy-unavailable":
          return t`Disconnecting is unavailable on the server right now. Try again in a few minutes.`;
        default:
          break;
      }
    }
    if (!(error instanceof ApiError)) return t`HTCO could not be reached. Check your connection.`;
    return t`The shop was not disconnected. Try again shortly.`;
  }

  return {
    ask: (shop) => {
      setConfirming(shop);
    },
    pendingShop: disconnect.isPending ? disconnect.variables.id : null,
    done,
    message: message(),
    dialogs: (
      <>
        <ConfirmDisconnect
          shop={confirming}
          onCancel={() => {
            setConfirming(null);
          }}
          onConfirm={(shop) => {
            setConfirming(null);
            setTarget(shop);
            disconnect.mutate(shop);
          }}
        />
        <StepUpDialog
          isOpen={askCode}
          context={<Trans>Disconnect a shop</Trans>}
          purpose={
            <Trans>
              Enter the 6-digit code from your authenticator app to disconnect the shop.
            </Trans>
          }
          onClose={() => {
            setAskCode(false);
            setTarget(null);
            disconnect.reset();
          }}
          onConfirmed={() => {
            setAskCode(false);
            if (target !== null) disconnect.mutate(target);
          }}
        />
      </>
    ),
  };
}

export interface Removals {
  /** Ask the Owner to confirm removing this shop and all its data. */
  ask: (shop: ShopView) => void;
  pendingShop: string | null;
  /** The shop just removed, for the page's confirmation. */
  done: string | undefined;
  /** Why the last attempt failed, in plain words. */
  message: string | undefined;
  /** The confirmation and code dialogs, rendered once by the page. */
  dialogs: ReactNode;
}

/**
 * Removing a shop: the Owner types the shop's name to confirm, then the 6-digit code, then the
 * API deletes the connection and every piece of the shop's data at once. It cannot be undone.
 * Answered "not found", the shop is already gone, which is what was asked.
 */
export function useRemovals(organizationId: string): Removals {
  const { t } = useLingui();
  const api = useApi();
  const queries = useQueryClient();
  const [confirming, setConfirming] = useState<ShopView | null>(null);
  const [target, setTarget] = useState<ShopView | null>(null);
  const [askCode, setAskCode] = useState(false);
  const [done, setDone] = useState<string | undefined>(undefined);

  const remove = useMutation({
    mutationFn: async (shop: ShopView) => {
      const { error, response } = await api.DELETE("/v1/shops/{shop_id}", {
        params: { path: { shop_id: shop.id } },
      });
      // 404: removed already (another tab, a repeated press): the shop is gone either way.
      if (!response.ok && response.status !== 404) throw apiError(response, error);
    },
    onMutate: () => {
      setDone(undefined);
    },
    onSuccess: async (_, shop) => {
      setTarget(null);
      queries.removeQueries({ queryKey: ["live", shop.id] });
      await queries.invalidateQueries({ queryKey: shopKeys.list(organizationId) });
      await queries.invalidateQueries({ queryKey: shopKeys.integrations(organizationId) });
      setDone(shop.name);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.type === "step-up-required") setAskCode(true);
    },
  });

  function message(): string | undefined {
    const error = remove.error;
    if (error === null) return undefined;
    if (error instanceof ApiError) {
      if (error.status === 401)
        return t`Your session has ended. Sign in again, then remove the shop.`;
      switch (error.type) {
        case "step-up-required":
          return undefined;
        case "mfa-required":
          return t`Set up two-factor sign-in in Security first, then remove the shop.`;
        case "forbidden":
          return t`Only the workspace owner can remove a shop.`;
        case "etsy-unavailable":
          return t`Removing shops is unavailable on the server right now. Try again in a few minutes.`;
        default:
          break;
      }
      return t`The shop was not removed. Try again shortly.`;
    }
    return t`HTCO could not be reached. Check your connection.`;
  }

  return {
    ask: (shop) => {
      setConfirming(shop);
    },
    pendingShop: remove.isPending ? remove.variables.id : null,
    done,
    message: message(),
    dialogs: (
      <>
        <ConfirmRemove
          shop={confirming}
          onCancel={() => {
            setConfirming(null);
          }}
          onConfirm={(shop) => {
            setConfirming(null);
            setTarget(shop);
            remove.mutate(shop);
          }}
        />
        <StepUpDialog
          isOpen={askCode}
          context={<Trans>Remove a shop</Trans>}
          purpose={
            <Trans>
              Enter the 6-digit code from your authenticator app to remove the shop and its data.
            </Trans>
          }
          onClose={() => {
            setAskCode(false);
            setTarget(null);
            remove.reset();
          }}
          onConfirmed={() => {
            setAskCode(false);
            if (target !== null) remove.mutate(target);
          }}
        />
      </>
    ),
  };
}

/** "Remove Willow & Wick?": what is deleted, that it cannot be undone, and the shop's name to type. */
function ConfirmRemove({
  shop,
  onCancel,
  onConfirm,
}: {
  shop: ShopView | null;
  onCancel: () => void;
  onConfirm: (shop: ShopView) => void;
}) {
  const { t } = useLingui();
  const [typed, setTyped] = useState("");
  const name = shop?.name ?? "";
  const matches = shop !== null && typed.trim() === name.trim();
  const close = () => {
    setTyped("");
    onCancel();
  };
  return (
    <ModalOverlay
      isDismissable
      isOpen={shop !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)] px-4 pt-[14vh] data-[entering]:animate-enter"
    >
      <Modal className="glass w-full max-w-[460px] rounded-panel border border-edge bg-menu p-6 shadow-popover outline-none data-[entering]:animate-pop-in">
        <Dialog role="alertdialog" className="outline-none">
          <form
            className="flex flex-col gap-6"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (shop !== null && matches) {
                setTyped("");
                onConfirm(shop);
              }
            }}
          >
            <div className="flex flex-col gap-1.5 text-start">
              <p className="m-0 text-caption font-light text-muted">
                <Trans>Remove a shop</Trans>
              </p>
              <Heading
                slot="title"
                className="m-0 font-display text-number-lg leading-[1.25] font-light"
              >
                {t`Remove ${name}?`}
              </Heading>
              <p className="m-0 text-body-sm text-secondary">
                <Trans>
                  HTCO disconnects the shop and deletes everything it stored about it at once: its
                  orders and their history, buyers, refunds, statistics and connection. This cannot
                  be undone.
                </Trans>
              </p>
              <p className="m-0 text-caption font-light text-muted">
                <Trans>Nothing changes in your Etsy shop.</Trans>
              </p>
            </div>
            <TextField
              label={t`Type the shop's name to confirm`}
              description={name}
              value={typed}
              onChange={setTyped}
              autoComplete="off"
              size="lg"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button slot="close" size="lg">
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit" variant="danger" size="lg" isDisabled={!matches}>
                <Trans>Remove shop</Trans>
              </Button>
            </div>
          </form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

/** "Disconnect Willow & Wick?": what happens, and the two choices. */
function ConfirmDisconnect({
  shop,
  onCancel,
  onConfirm,
}: {
  shop: ShopView | null;
  onCancel: () => void;
  onConfirm: (shop: ShopView) => void;
}) {
  const { t } = useLingui();
  const name = shop?.name ?? "";
  return (
    <ModalOverlay
      isDismissable
      isOpen={shop !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)] px-4 pt-[14vh] data-[entering]:animate-enter"
    >
      <Modal className="glass w-full max-w-[440px] rounded-panel border border-edge bg-menu p-6 shadow-popover outline-none data-[entering]:animate-pop-in">
        <Dialog role="alertdialog" className="flex flex-col gap-6 outline-none">
          <div className="flex flex-col gap-1.5 text-start">
            <p className="m-0 text-caption font-light text-muted">
              <Trans>Disconnect a shop</Trans>
            </p>
            <Heading
              slot="title"
              className="m-0 font-display text-number-lg leading-[1.25] font-light"
            >
              {t`Disconnect ${name}?`}
            </Heading>
            <p className="m-0 text-body-sm text-secondary">
              <Trans>
                HTCO deletes its access to this shop at once and stops syncing. The shop's data in
                HTCO is deleted after 30 days unless you reconnect.
              </Trans>
            </p>
            <p className="m-0 text-caption font-light text-muted">
              <Trans>
                Etsy does not let apps cancel their own access, so you can also remove HTCO in your
                Etsy account settings. Nothing changes in your Etsy shop.
              </Trans>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button slot="close" size="lg">
              <Trans>Cancel</Trans>
            </Button>
            <Button
              variant="danger"
              size="lg"
              onPress={() => {
                if (shop !== null) onConfirm(shop);
              }}
            >
              <Trans>Disconnect</Trans>
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

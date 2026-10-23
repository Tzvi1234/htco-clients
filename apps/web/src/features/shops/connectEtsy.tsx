import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useState, type ReactNode, type SyntheticEvent } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

import { CodeBoxes } from "../../shared/ui/kit/index.ts";
import { useCodeMessage } from "../auth/SecondFactorPage.tsx";
import { ApiError, apiError, useApi } from "../../shared/api/api.tsx";
import { browser } from "../../shared/lib/browser.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { FormAlert } from "../auth/AuthLayout.tsx";

/** Etsy's consent screen address, when the browser may follow it: https, or this app itself. */
export function trustedAddress(address: string, origin: string): string | null {
  try {
    const url = new URL(address, origin);
    return url.protocol === "https:" || url.origin === origin ? url.href : null;
  } catch {
    return null;
  }
}

class UntrustedAddress extends Error {}

export interface ConnectEtsy {
  /** Start connecting (or reconnecting); `key` marks which button shows the spinner. */
  start: (key: string) => void;
  pendingKey: string | null;
  /** Why the last attempt failed, in plain words. */
  message: string | undefined;
  /** The code dialog, rendered once by the page. */
  dialog: ReactNode;
}

/**
 * Connecting an Etsy shop (slice 4.3): ask the API for Etsy's consent address and go there with
 * a full page load. The API wants a fresh second factor first; then the authenticator code is
 * asked for in a dialog and the request is sent again.
 */
export function useConnectEtsy(): ConnectEtsy {
  const { t } = useLingui();
  const api = useApi();
  const [key, setKey] = useState<string | null>(null);
  const [askCode, setAskCode] = useState(false);

  const connect = useMutation({
    mutationFn: async () => {
      const { data, error, response } = await api.POST("/v1/shops/etsy/connect");
      if (data === undefined) throw apiError(response, error);
      const address = trustedAddress(data.authorization_url, window.location.origin);
      if (address === null) throw new UntrustedAddress();
      return address;
    },
    onSuccess: (address) => {
      browser.assign(address);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.type === "step-up-required") setAskCode(true);
    },
  });

  function message(): string | undefined {
    const error = connect.error;
    if (error === null) return undefined;
    if (error instanceof ApiError) {
      switch (error.type) {
        case "step-up-required":
          return undefined;
        case "mfa-required":
          return t`Set up two-factor sign-in in Security first, then connect the shop.`;
        case "forbidden":
          return t`Only the workspace owner can connect a shop.`;
        case "etsy-unavailable":
          return t`Etsy cannot be reached right now. Try again in a few minutes.`;
        default:
          break;
      }
    }
    if (error instanceof UntrustedAddress)
      return t`Etsy's sign-in address looked wrong, so it was not opened. Try again shortly.`;
    return t`This did not work. Try again shortly.`;
  }

  return {
    start: (next) => {
      setKey(next);
      connect.mutate();
    },
    pendingKey: connect.isPending ? key : null,
    message: message(),
    dialog: (
      <StepUpDialog
        isOpen={askCode}
        onClose={() => {
          setAskCode(false);
          connect.reset();
        }}
        onConfirmed={() => {
          setAskCode(false);
          connect.mutate();
        }}
      />
    ),
  };
}

/** "Confirm it is you": the 6-digit code that opens a ten-minute window for sensitive actions. */
export function StepUpDialog({
  isOpen,
  onClose,
  onConfirmed,
  context,
  purpose,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  /** The small line above the title: what is being confirmed (default: connecting a shop). */
  context?: ReactNode;
  /** What the code is for, after "Enter the 6-digit code…". */
  purpose?: ReactNode;
}) {
  const api = useApi();
  const codeMessage = useCodeMessage();
  const [code, setCode] = useState("");
  const confirm = useMutation({
    mutationFn: async () => {
      const { error, response } = await api.POST("/v1/auth/step-up", { body: { code } });
      if (!response.ok) throw apiError(response, error);
    },
    onSuccess: () => {
      setCode("");
      confirm.reset();
      onConfirmed();
    },
  });

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    confirm.mutate();
  }

  return (
    <ModalOverlay
      isDismissable
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setCode("");
          confirm.reset();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)] px-4 pt-[14vh] data-[entering]:animate-enter"
    >
      <Modal className="glass w-full max-w-[420px] rounded-panel border border-edge bg-menu p-6 shadow-popover outline-none data-[entering]:animate-pop-in">
        <Dialog className="outline-none">
          <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
            <div className="flex flex-col gap-1.5 text-start">
              <p className="m-0 text-caption font-light text-muted">
                {context ?? <Trans>Connect an Etsy shop</Trans>}
              </p>
              <Heading
                slot="title"
                className="m-0 font-display text-number-lg leading-[1.25] font-light"
              >
                <Trans>Confirm it is you</Trans>
              </Heading>
              <p className="m-0 text-body-sm text-secondary">
                {purpose ?? (
                  <Trans>
                    Enter the 6-digit code from your authenticator app to connect the shop.
                  </Trans>
                )}
              </p>
            </div>
            <CodeBoxes value={code} onChange={setCode} autoFocus invalid={confirm.isError} />
            <FormAlert message={codeMessage(confirm.error)} />
            <div className="grid grid-cols-2 gap-2">
              <Button slot="close" size="lg">
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit" variant="primary" size="lg" isPending={confirm.isPending}>
                <Trans>Confirm</Trans>
              </Button>
            </div>
            <p className="m-0 text-center text-caption font-light text-muted">
              <Trans>The confirmation lasts ten minutes.</Trans>
            </p>
          </form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

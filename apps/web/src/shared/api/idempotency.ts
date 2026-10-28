// The `Idempotency-Key` of a user action (platform PR #223): a fresh UUID for each action, and
// the same one when the person tries that action again after it failed (a lost answer, a 503),
// so the server runs it at most once. Held in memory only, never in storage or the address.
import { useRef } from "react";

export const IDEMPOTENCY_HEADER = "Idempotency-Key";

export interface ActionKey {
  /**
   * The key of the action described by `signature` (the job, the orders chosen): the last key
   * again while the action is unchanged and has not succeeded, a fresh one otherwise. Never put
   * buyer data in the signature; call `reset` when such an input changes instead.
   */
  key: (signature?: string) => string;
  /** The action succeeded or its inputs changed: the next press is a new action. */
  reset: () => void;
}

export function newActionKey(): string {
  return crypto.randomUUID();
}

export function useActionKey(): ActionKey {
  const last = useRef<{ signature: string; key: string } | null>(null);
  return {
    key: (signature = "") => {
      if (last.current?.signature !== signature) last.current = { signature, key: newActionKey() };
      return last.current.key;
    },
    reset: () => {
      last.current = null;
    },
  };
}

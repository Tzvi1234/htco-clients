import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CheckIcon } from "./icons.tsx";
import { cx } from "../lib/cx.ts";

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

const VISIBLE_MS = 1800;

/**
 * The Design 1C toast: a short ink pill at the bottom centre that confirms what just happened
 * ("Tweaks reset"), announced politely and gone after 1.8 s. Only for outcomes the app has
 * confirmed; failures stay inline beside their cause.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; shown: boolean }>({
    message: "",
    shown: false,
  });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback<ShowToast>((message) => {
    clearTimeout(timer.current);
    setToast({ message, shown: true });
    timer.current = setTimeout(() => {
      setToast((current) => ({ ...current, shown: false }));
    }, VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  return (
    <ToastContext value={show}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        data-shown={toast.shown || undefined}
        className={cx(
          "pointer-events-none fixed inset-s-1/2 bottom-24 z-toast flex h-10 -translate-x-1/2 items-center gap-2 rounded-pill bg-inverse px-5 text-body-sm text-on-inverse sm:bottom-6 rtl:translate-x-1/2",
          "opacity-0 transition-[opacity,translate] duration-[var(--motion-duration-base)] ease-standard",
          "data-[shown]:opacity-100",
          !toast.shown && "translate-y-2",
        )}
      >
        {toast.shown ? (
          <>
            <CheckIcon size={14} />
            {toast.message}
          </>
        ) : null}
      </div>
    </ToastContext>
  );
}

/** Shows a toast; outside a ToastProvider (stories, tests of one component) it does nothing. */
export function useToast(): ShowToast {
  return use(ToastContext) ?? noop;
}

function noop(): void {
  // No toast region here.
}

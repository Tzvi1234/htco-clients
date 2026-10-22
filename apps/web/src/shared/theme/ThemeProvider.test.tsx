import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TweaksProvider } from "./ThemeProvider.tsx";
import { DEFAULT_TWEAKS, REDUCED_TRANSPARENCY_QUERY } from "./tweaks.ts";

/** A matchMedia whose "reduce transparency" answer the test can change, telling listeners. */
function deviceTransparency(reduce: boolean) {
  const listeners = new Set<() => void>();
  let matches = reduce;
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return query === REDUCED_TRANSPARENCY_QUERY && matches;
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }));
  return (next: boolean) => {
    matches = next;
    for (const listener of listeners) listener();
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("frosted glass and the device's reduce transparency (round 2)", () => {
  it("turns glass off and back on when the device setting changes while the app is open", () => {
    const setReduce = deviceTransparency(false);
    const root = document.createElement("html");
    render(
      <TweaksProvider
        initialTweaks={{ ...DEFAULT_TWEAKS, glass: 3 }}
        storage={undefined}
        root={root}
      >
        <p>app</p>
      </TweaksProvider>,
    );
    expect(root.dataset["t2"]).toBe("3");

    act(() => {
      setReduce(true);
    });
    expect(root.dataset["t2"]).toBe("1");

    act(() => {
      setReduce(false);
    });
    expect(root.dataset["t2"]).toBe("3");
  });
});

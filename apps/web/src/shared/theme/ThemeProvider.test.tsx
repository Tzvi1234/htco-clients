import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DARK_SCHEME_QUERY, TweaksProvider, useSystemTheme } from "./ThemeProvider.tsx";
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
  it("makes the glass solid and frosted again when the device setting changes while the app is open", () => {
    const setReduce = deviceTransparency(false);
    const root = document.createElement("html");
    render(
      <TweaksProvider initialTweaks={DEFAULT_TWEAKS} storage={undefined} root={root}>
        <p>app</p>
      </TweaksProvider>,
    );
    expect(root.hasAttribute("data-solid")).toBe(false);

    act(() => {
      setReduce(true);
    });
    expect(root.dataset["solid"]).toBe("");

    act(() => {
      setReduce(false);
    });
    expect(root.hasAttribute("data-solid")).toBe(false);
  });
});

function SystemTheme() {
  return <p>{useSystemTheme()}</p>;
}

describe("the system theme (what Settings shows beside System)", () => {
  it("follows the device's light or dark setting live", () => {
    const listeners = new Set<() => void>();
    let dark = false;
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return query === DARK_SCHEME_QUERY && dark;
      },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    }));
    const { container } = render(<SystemTheme />);
    expect(container.textContent).toBe("light");

    act(() => {
      dark = true;
      for (const listener of listeners) listener();
    });
    expect(container.textContent).toBe("dark");
  });
});

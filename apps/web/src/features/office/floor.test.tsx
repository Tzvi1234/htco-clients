import { createMemoryHistory } from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { REDUCED_MOTION_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { fakeBackend } from "../../test/fakeApi.ts";

// The 3D scene needs WebGL; here it is a stand-in that records what the page asks of it.
const scenes = vi.hoisted(() => [] as { still: boolean; setStill: ReturnType<typeof vi.fn> }[]);

vi.mock("./floor3d/webgl.ts", () => ({ hasWebGL: () => true }));
vi.mock("./floor3d/scene.ts", () => ({
  OfficeScene: class {
    still: boolean;
    setStill = vi.fn();
    constructor(options: { still: boolean }) {
      this.still = options.still;
      scenes.push(this);
    }
    start = vi.fn();
    dispose = vi.fn();
    setPalette = vi.fn();
    relabel = vi.fn();
    resetView = vi.fn();
  },
}));

/** matchMedia whose reduced-motion answer the test can change, telling the listeners. */
function motionSetting(reduce: boolean) {
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return query === REDUCED_MOTION_QUERY && reduce;
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }));
  return (next: boolean) => {
    reduce = next;
    for (const listener of listeners) listener();
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  scenes.length = 0;
});

describe("the live office map", () => {
  it("follows reduced motion when the system setting changes while it is open", async () => {
    const setReduce = motionSetting(false);
    render(
      <App
        locale="en"
        theme="system"
        storage={memoryStorage()}
        history={createMemoryHistory({ initialEntries: ["/office/floor"] })}
        api={fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" }).client}
      />,
    );
    await screen.findByRole("heading", { level: 1, name: "Floor" });
    await vi.waitFor(() => {
      expect(scenes).toHaveLength(1);
    });
    const scene = scenes[0];
    expect(scene?.still).toBe(false);

    act(() => {
      setReduce(true);
    });
    expect(scene?.setStill).toHaveBeenLastCalledWith(true);

    act(() => {
      setReduce(false);
    });
    expect(scene?.setStill).toHaveBeenLastCalledWith(false);
  });
});

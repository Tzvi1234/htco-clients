import { createMemoryHistory } from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../app/App.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { REDUCED_MOTION_QUERY } from "../../shared/lib/useMediaQuery.ts";
import { fakeBackend } from "../../test/fakeApi.ts";

// The 3D scene needs WebGL; here it is a stand-in that records what the page asks of it.
const scenes = vi.hoisted(() => [] as { still: boolean; setStill: ReturnType<typeof vi.fn> }[]);
// The scene module arrives when the test opens this gate (it is imported on demand, like three.js).
const loading = vi.hoisted(() => {
  let open: () => void = () => undefined;
  const done = new Promise<void>((resolve) => {
    open = resolve;
  });
  return {
    done,
    open: () => {
      open();
    },
  };
});

vi.mock("./floor3d/webgl.ts", () => ({ hasWebGL: () => true }));
vi.mock("./floor3d/scene.ts", async () => {
  await loading.done;
  return {
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
  };
});

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

/** Waits (in real time) until the page has built its scene from the imported module. */
async function sceneBuilt() {
  for (let i = 0; i < 40 && scenes.length === 0; i++)
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
  expect(scenes).toHaveLength(1);
}

function openFloor() {
  render(
    <App
      locale="en"
      theme="system"
      storage={memoryStorage()}
      history={createMemoryHistory({ initialEntries: ["/office/floor"] })}
      api={fakeBackend({ signedIn: true, enrolled: true, assurance: "aal2" }).client}
    />,
  );
}

// The two tests share one module import (it loads once per file), so their order matters:
// keep them in file order even though the suite shuffles tests.
describe("the live office map", { shuffle: false }, () => {
  // First: the scene module is imported only once per file, so only this test sees it load.
  it("builds the scene with the motion setting of when it arrives, not of when it was asked for", async () => {
    const setReduce = motionSetting(false);
    openFloor();
    await screen.findByRole("heading", { level: 1, name: "Floor" });
    act(() => {
      setReduce(true);
    });
    loading.open();
    await sceneBuilt();
    expect(scenes[0]?.still).toBe(true);
  });

  it("follows reduced motion when the system setting changes while it is open", async () => {
    const setReduce = motionSetting(false);
    openFloor();
    await screen.findByRole("heading", { level: 1, name: "Floor" });
    loading.open(); // already open after the first test; harmless if it runs alone
    await sceneBuilt();
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

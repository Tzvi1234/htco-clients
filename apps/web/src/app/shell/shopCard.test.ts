import { describe, expect, it } from "vitest";

import { shopCardState } from "./ShopSwitcher.tsx";

const loaded = (count: number) => ({ status: "success" as const, count });

describe("the sidebar's shop card", () => {
  it("counts the shops of every workspace the user belongs to, not only the first", () => {
    expect(shopCardState([loaded(0), loaded(2)])).toBe("shops");
  });

  it("says no shop is connected only when every workspace has answered with none", () => {
    expect(shopCardState([loaded(0), loaded(0)])).toBe("none");
  });

  it("stays neutral while a workspace's shops are loading or could not be read", () => {
    expect(shopCardState([loaded(0), { status: "pending", count: 0 }])).toBe("unknown");
    expect(shopCardState([loaded(0), { status: "error", count: 0 }])).toBe("unknown");
    expect(shopCardState([])).toBe("unknown");
  });

  it("knows there are shops as soon as one workspace has some, even while others load", () => {
    expect(shopCardState([loaded(1), { status: "pending", count: 0 }])).toBe("shops");
  });
});

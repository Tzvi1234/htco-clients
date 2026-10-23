import { describe, expect, it } from "vitest";

import { AREAS, areaOf, locate, navDirection, sameArea } from "./nav.ts";

describe("the navigation model (Design 1C, client ADR-0008)", () => {
  it("has the demo's seven areas in order, grouped home, workspace and system", () => {
    expect(AREAS.map(({ id, group }) => `${group}:${id}`)).toEqual([
      "main:home",
      "workspace:office",
      "workspace:work",
      "workspace:commerce",
      "workspace:customers",
      "workspace:finance",
      "system:admin",
    ]);
  });

  it("has the demo's tabs in each area", () => {
    expect(
      Object.fromEntries(AREAS.map(({ id, tabs }) => [id, tabs.map((tab) => tab.id)])),
    ).toEqual({
      home: [],
      office: ["floor", "chat", "team", "aiops", "eng"],
      work: ["tasks", "approvals", "activity"],
      commerce: ["shops", "orders", "products", "shipping", "suppliers"],
      customers: ["tickets", "customers", "mail", "marketing"],
      finance: ["overview", "ledger"],
      admin: ["health", "automations", "members", "settings"],
    });
  });

  it("maps the screens that exist to their routes and marks every other tab as coming soon", () => {
    const built = AREAS.flatMap(({ id, tabs }) =>
      tabs.filter((tab) => tab.built).map((tab) => `${id}/${tab.id} ${tab.to}`),
    );
    expect(built).toEqual([
      "commerce/shops /shops",
      "commerce/orders /commerce/orders",
      "commerce/products /commerce/products",
      "commerce/shipping /commerce/shipping",
      "customers/customers /customers/customers",
      "admin/health /admin/health",
      "admin/members /settings/team",
      "admin/settings /settings",
    ]);
    for (const area of AREAS) {
      for (const tab of area.tabs.filter(({ built: isBuilt }) => !isBuilt)) {
        expect(tab.to).toBe(`/${area.id}/${tab.id}`);
      }
    }
  });

  it("gives every tab its own address", () => {
    const paths = AREAS.flatMap(({ tabs }) => tabs.map(({ to }) => to));
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("locate", () => {
  it.each([
    ["/", "home", undefined],
    ["/shops", "commerce", "shops"],
    ["/integrations/etsy/callback", "commerce", "shops"],
    ["/settings", "admin", "settings"],
    ["/settings/security", "admin", "settings"],
    ["/settings/team", "admin", "members"],
    ["/office/chat", "office", "chat"],
    ["/finance/ledger", "finance", "ledger"],
  ])("puts %s in %s / %s", (path, area, tab) => {
    const found = locate(path);
    expect(found?.area.id).toBe(area);
    expect(found?.tab?.id).toBe(tab);
  });

  it("knows no area for an unknown address", () => {
    expect(locate("/no-such-page")).toBeUndefined();
  });
});

describe("areaOf", () => {
  it("finds an area by its id", () => {
    expect(areaOf("work").tabs[1]?.id).toBe("approvals");
  });
});

describe("screen-to-screen direction (round 3)", () => {
  it("travels forward to a later place in the navigation and back to an earlier one", () => {
    expect(navDirection("/", "/shops")).toBe("forward");
    expect(navDirection("/settings", "/settings/team")).toBe("back");
    expect(navDirection("/shops", "/")).toBe("back");
  });

  it("only fades when either end is outside the navigation, or on the first load", () => {
    expect(navDirection(undefined, "/shops")).toBe("fade");
    expect(navDirection("/nowhere", "/shops")).toBe("fade");
    expect(navDirection("/shops", "/shops")).toBe("fade");
  });

  it("knows two tabs of one area, where the current pill glides", () => {
    expect(sameArea("/settings/team", "/settings")).toBe(true);
    expect(sameArea("/shops", "/settings")).toBe(false);
    expect(sameArea("/", "/shops")).toBe(false);
    expect(sameArea(undefined, "/shops")).toBe(false);
  });
});

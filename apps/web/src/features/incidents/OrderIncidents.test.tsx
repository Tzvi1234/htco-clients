import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderIncidents } from "./OrderIncidents.tsx";
import { ApiProvider } from "../../shared/api/api.tsx";
import { LocaleProvider } from "../../shared/i18n/LocaleProvider.tsx";
import { memoryStorage } from "../../shared/lib/storage.ts";
import { fakeBackend } from "../../test/fakeApi.ts";
import { demoIncidents } from "../../test/fakeIncidents.ts";

const ORG = "a0000000-0000-7000-8000-000000000000";

function renderFor(receipt: number, shop = "shop-1") {
  const backend = fakeBackend({
    signedIn: true,
    enrolled: true,
    assurance: "aal2",
    incidents: demoIncidents(["shop-1", "shop-2"]),
  });
  const root = createRootRoute({
    component: () => <OrderIncidents organizationId={ORG} shopId={shop} receiptId={receipt} />,
  });
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  render(
    <LocaleProvider initialLocale="en" storage={memoryStorage()}>
      <QueryClientProvider client={new QueryClient()}>
        <ApiProvider client={backend.client}>
          <RouterProvider router={router} />
        </ApiProvider>
      </QueryClientProvider>
    </LocaleProvider>,
  );
  return backend;
}

describe("OrderIncidents (slice 6.3: the order-to-incident link)", () => {
  it("links each incident of the order to the incident center, with its state as glyph and word", async () => {
    const [first] = demoIncidents(["shop-1"]);
    if (first?.receipt_id == null) throw new Error("the demo has an order incident");
    renderFor(first.receipt_id);
    const link = await screen.findByRole("link", { name: /incident/i }, { timeout: 5000 });
    expect(link.getAttribute("href")).toContain(`/incidents/${first.id}`);
  });

  it("asks the API for this one order in its own workspace, not every workspace's history", async () => {
    const [first] = demoIncidents(["shop-1"]);
    if (first?.receipt_id == null) throw new Error("the demo has an order incident");
    const backend = renderFor(first.receipt_id);
    await screen.findByRole("link", { name: /incident/i }, { timeout: 5000 });
    expect(backend.state.incidentLists).toHaveLength(1);
    const query = new URLSearchParams(backend.state.incidentLists[0]);
    expect(query.get("organization_id")).toBe(ORG);
    expect(query.get("shop_id")).toBe("shop-1");
    expect(query.get("receipt_id")).toBe(String(first.receipt_id));
    expect(query.get("state")).toBe("all");
  });

  it("does not show another shop's incident with the same receipt number", async () => {
    const [first] = demoIncidents(["shop-1"]);
    if (first?.receipt_id == null) throw new Error("the demo has an order incident");
    renderFor(first.receipt_id, "shop-9");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders nothing for an order without incidents", async () => {
    renderFor(1);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("link")).toBeNull();
  });
});

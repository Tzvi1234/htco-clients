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

function renderFor(receipt: number) {
  const backend = fakeBackend({
    signedIn: true,
    enrolled: true,
    assurance: "aal2",
    incidents: demoIncidents(["shop-1"]),
  });
  const root = createRootRoute({
    component: () => <OrderIncidents receiptId={receipt} />,
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

  it("renders nothing for an order without incidents", async () => {
    renderFor(1);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("link")).toBeNull();
  });
});

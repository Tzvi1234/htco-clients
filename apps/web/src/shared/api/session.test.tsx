import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { forgetSession } from "./api.tsx";

// Sage's security review of clients#48: when a session ends, nothing the last user saw may be
// shown to the next one on the same tab. Every cached answer belongs to the session that read
// it: shops, members, incidents, notifications, orders.

const ORG = "a0000000-0000-7000-8000-000000000000";

describe("the session's cache", () => {
  it("forgets every cached answer, not only a list of them", () => {
    const client = new QueryClient();
    client.setQueryData(["auth", "me"], { user: "a" });
    client.setQueryData(["live", "shop", "orders", "all"], { items: ["order"] });
    client.setQueryData(["shops", ORG], [{ id: "shop-a" }]);
    client.setQueryData(["organizations", ORG, "members"], [{ display_name: "User A" }]);
    client.setQueryData(["incidents", ORG, "open"], [{ id: "incident-a" }]);
    client.setQueryData(["notifications", ORG], { items: [{ id: "notice-a" }] });

    forgetSession(client);

    expect(client.getQueryCache().getAll()).toEqual([]);
  });
});

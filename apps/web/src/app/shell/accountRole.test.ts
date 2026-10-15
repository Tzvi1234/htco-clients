import { describe, expect, it } from "vitest";

import { accountRole } from "./UserMenu.tsx";

describe("the account card's role", () => {
  it("names the role when every workspace gives the same one", () => {
    expect(accountRole([{ role: "owner" }, { role: "owner" }])).toBe("owner");
  });

  it("names none when workspaces give different roles, since none of them is current", () => {
    expect(accountRole([{ role: "viewer" }, { role: "owner" }])).toBe("several");
  });

  it("names none before the account is known", () => {
    expect(accountRole([])).toBeUndefined();
  });
});

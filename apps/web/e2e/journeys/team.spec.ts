import { expect, test } from "@playwright/test";

import { checkpoint, openApp, pageTitle } from "./support.ts";

test("an Owner invites a member and gets the link to send", async ({ page }) => {
  await openApp(page, "/settings/team", "signed-in");
  await expect(pageTitle(page, "Members & access")).toBeVisible();
  // The members table: its body rows, one per member.
  const members = page.getByRole("table", { name: "Members" }).locator("tbody tr");
  await expect(members).toHaveCount(1);
  await checkpoint(page, "team");

  await page.getByLabel("Email").fill("dana@example.test");
  await page.getByRole("button", { name: "Invite", exact: true }).click();

  // The server's answer, not an optimistic one: the link it made and the new member.
  const link = page.getByRole("textbox", { name: "Invitation link" });
  await expect(link).toHaveValue(/verify\?token=/);
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
  await expect(members).toHaveCount(2);
  await checkpoint(page, "team-invited");
});

test("an invited person sets a password from the link and is signed in", async ({ page }) => {
  await openApp(
    page,
    "/accept-invite#access_token=invite-at&refresh_token=invite-rt&type=invite",
    "signed-out",
  );
  await expect(pageTitle(page, "Set your password")).toBeVisible();
  // The tokens leave the address bar straight away.
  await expect(page).not.toHaveURL(/access_token/);
  await checkpoint(page, "accept-invite");

  await page.getByLabel("New password").fill("a long new password");
  await page.getByLabel("Repeat the password").fill("a long new password");
  await page.getByRole("button", { name: "Save and sign in" }).click();

  // Signed in. The demo's invitation is for an Owner, who sets up a second factor first.
  await expect(pageTitle(page, "Set up your authenticator app")).toBeVisible();
  await checkpoint(page, "invite-accepted");
});

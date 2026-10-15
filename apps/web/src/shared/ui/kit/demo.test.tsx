import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { DemoFrame, DemoPart, DemoTag } from "./index.ts";
import { LocaleProvider } from "../../i18n/LocaleProvider.tsx";
import { PageHeader, TopBarSlotContext } from "../PageHeader.tsx";
import { ToastProvider } from "../Toast.tsx";

function show(children: ReactNode, locale: "en" | "he" = "en") {
  render(
    <LocaleProvider initialLocale={locale} storage={undefined}>
      <ToastProvider>{children}</ToastProvider>
    </LocaleProvider>,
  );
  return userEvent.setup();
}

/** The shell's toast region (a polite live region). */
async function toastSays(text: string) {
  const region = document.querySelector("[aria-live='polite'][aria-atomic='true']");
  await vi.waitFor(() => {
    expect(region).toHaveTextContent(text);
  });
}

describe("DemoFrame (the one demo treatment)", () => {
  it("shows the demo's own layout dimmed and out of reach, under the large DEMO label", () => {
    show(
      <DemoFrame title="Approvals" layout="l2">
        <button type="button">Approve</button>
        <p>Order #3152</p>
      </DemoFrame>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Approvals" })).toBeInTheDocument();
    const content = screen.getByTestId("demo-content");
    expect(content).toHaveAttribute("inert");
    expect(content).toHaveAttribute("aria-hidden", "true");
    expect(content.firstElementChild).toHaveAttribute("data-layout", "l2");
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.getByText("DEMO")).toBeInTheDocument();
    expect(screen.getByText("Sample data · coming soon")).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("Demo — coming soon");
  });

  it("labels it in Hebrew too", () => {
    show(
      <DemoFrame title="אישורים">
        <p>Order #3152</p>
      </DemoFrame>,
      "he",
    );
    expect(screen.getByText("דמו")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "דמו — בקרוב" })).toBeInTheDocument();
  });

  it("says 'coming soon' when its content is pressed, and nothing else happens", async () => {
    const submit = vi.fn();
    const user = show(
      <DemoFrame title="Approvals">
        <form onSubmit={submit}>
          <p>Order #3152</p>
        </form>
      </DemoFrame>,
    );
    await user.click(screen.getByText("Order #3152"));
    await toastSays("Demo — coming soon");
    expect(submit).not.toHaveBeenCalled();
  });

  it("puts the label in the shell's top bar, centred there, not over the content", () => {
    function Shell({ children }: { children: ReactNode }) {
      return (
        <TopBarSlotContext value={document.getElementById("slot")}>{children}</TopBarSlotContext>
      );
    }
    const header = document.createElement("header");
    const slot = document.createElement("div");
    slot.id = "slot";
    header.append(slot);
    document.body.append(header);
    show(
      <Shell>
        <PageHeader title="Orders" />
        <DemoFrame>
          <p>Order #3152</p>
        </DemoFrame>
      </Shell>,
    );
    const note = within(header).getByRole("note");
    expect(note).toHaveTextContent("DEMO");
    expect(note).toHaveClass("absolute", "inset-x-0", "justify-center");
    expect(within(screen.getByTestId("demo-content")).queryByRole("note")).toBeNull();
    header.remove();
  });

  it("in views mode lets view controls work, and only says 'coming soon' for actions", async () => {
    const view = vi.fn();
    const act = vi.fn();
    const user = show(
      <DemoFrame title="Chat" views>
        <button type="button" data-demo-view="" onClick={view}>
          Noa
        </button>
        <button type="button" onClick={act}>
          Send
        </button>
      </DemoFrame>,
    );

    const frame = screen.getByRole("region", { name: "Demo — coming soon" });
    expect(screen.getByTestId("demo-content")).not.toHaveAttribute("inert");
    await user.click(within(frame).getByRole("button", { name: "Noa" }));
    expect(view).toHaveBeenCalledOnce();
    await user.click(within(frame).getByRole("button", { name: "Send" }));
    expect(act).not.toHaveBeenCalled();
    await toastSays("Demo — coming soon");
  });
});

describe("DemoPart (a planned part of a real screen)", () => {
  it("dims the part, keeps it out of reach and says what it is", async () => {
    const user = show(
      <section aria-label="Shop">
        <DemoPart>
          <button type="button">Orders today</button>
        </DemoPart>
      </section>,
    );
    const shop = screen.getByRole("region", { name: "Shop" });
    const part = shop.querySelector("[data-demo-part]");
    expect(part).not.toBeNull();
    expect(within(part as HTMLElement).getByText("Demo")).toBeInTheDocument();
    expect(part?.querySelector("[inert][aria-hidden='true']")).not.toBeNull();
    expect(within(shop).queryByRole("button", { name: "Orders today" })).not.toBeInTheDocument();
    expect(within(shop).getByText("Demo — coming soon")).toBeInTheDocument();

    await user.click(within(part as HTMLElement).getByText("Orders today"));
    await toastSays("Demo — coming soon");
  });

  it("leaves the tag out when the panel's header carries it", () => {
    show(
      <>
        <DemoTag />
        <DemoPart tag={false}>
          <p>Policy</p>
        </DemoPart>
      </>,
    );
    expect(screen.getAllByText("Demo")).toHaveLength(1);
  });
});

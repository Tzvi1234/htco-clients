import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DemoScreen } from "./DemoScreen.tsx";
import { LocaleProvider } from "../i18n/LocaleProvider.tsx";

function show(children?: React.ReactNode, locale: "en" | "he" = "en") {
  render(
    <LocaleProvider initialLocale={locale} storage={undefined}>
      <DemoScreen title="Approvals" className="grid grid-cols-2 gap-2">
        {children}
      </DemoScreen>
    </LocaleProvider>,
  );
}

describe("DemoScreen", () => {
  it("without content, says plainly that the screen is coming", () => {
    show();
    expect(screen.getByRole("heading", { level: 1, name: "Approvals" })).toBeInTheDocument();
    expect(screen.getByText("Demo — coming soon")).toBeInTheDocument();
  });

  it("shows the demo's own layout dimmed, out of reach, under a large DEMO label", () => {
    show(
      <>
        <button type="button">Approve</button>
        <p>Order #3152</p>
      </>,
    );

    const content = screen.getByTestId("demo-content");
    expect(content).toHaveAttribute("inert");
    expect(content).toHaveClass("grid", "grid-cols-2");
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.getByText("DEMO")).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("Demo — coming soon");
  });

  it("labels it in Hebrew too", () => {
    show(<p>Order #3152</p>, "he");
    expect(screen.getByText("דמו")).toBeInTheDocument();
  });
});
